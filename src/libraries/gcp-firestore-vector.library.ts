
// Import firestore package
import { Firestore, DocumentData, QueryDocumentSnapshot, VectorQuerySnapshot, FieldValue, Query, VectorQuery, VectorValue, WhereFilterOp, DocumentSnapshot } from "@google-cloud/firestore";

// Import sdk configs
import { 
  gcpAiPlatformLibrary,
  gcpFirestoreLibrary, 
} from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { GcpFirestoreVectorRecordListingFilterOptions } from "../dtos/Common.gcp-firestore-vector.dto";
import { GcpFirestoreRecordListingResponseDTO, GcpFirestoreRecordListingPaginationResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";
import { gcpFirestoreBase64EncodeStrToLastKey, gcpFirestorelastKeyToBase64EncodeStr } from "../helpers/gcp-firestore.helper";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * Search with vector embeddings
 * @see https://firebase.google.com/docs/firestore/vector-search
 */
class GcpFirestoreVectorLibrary {
  constructor() {
    if (
      !process.env.APP_GCP_AI_PLATFORM_MODEL_NAME 
    ) {
      global.logger.error(
        `MODEL_NAME is not defined in .env file.`,
        {
          modelName: process.env.APP_GCP_AI_PLATFORM_MODEL_NAME,
        }
      );
      throw new BaseError(
        "MODEL_NAME is not defined in .env file.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }
  }
  private readonly MODEL_NAME = process.env.APP_GCP_AI_PLATFORM_MODEL_NAME as string;

  /**
   * Store vector embeddings
   * @see https://firebase.google.com/docs/firestore/vector-search#store_vector_embeddings
   */
  async createDocumentWithEmbedding<DbEntityDto extends DocumentData>(
    commonDbDetails: GcpFirestoreInteractionDto,
    data: DbEntityDto,
    embeddingText: string
  ): Promise<DbEntityDto | undefined> {
    const { embedding, dimensions } =
      await gcpAiPlatformLibrary.generateEmbedding(embeddingText);

    const documentWithEmbedding: DbEntityDto & {
      embeddingVector: VectorValue;
      embeddingGeneratedAt: string;
      embeddingModel: string;
      embeddingDimensions: number;
      embeddingOptimizedForSearch: boolean;
    } = {
      ...data,
      embeddingVector: FieldValue.vector(embedding),
      embeddingGeneratedAt: dateHelperObj.getISODate(),
      embeddingModel: this.MODEL_NAME,
      embeddingDimensions: dimensions,
      embeddingOptimizedForSearch: true,
    };

    return gcpFirestoreLibrary.createDocument<
      DbEntityDto & {
        embeddingVector: VectorValue;
        embeddingGeneratedAt: string;
        embeddingModel: string;
        embeddingDimensions: number;
        embeddingOptimizedForSearch: boolean;
      }
    >(commonDbDetails, documentWithEmbedding);
  }

  async updateDocumentWithEmbedding<
    UpdateEntityDto extends DocumentData,
    DbEntityDto
  >(
    commonDbDetails: GcpFirestoreInteractionDto,
    id: string,
    data: UpdateEntityDto,
    embeddingText: string,
    title?: string
  ): Promise<DbEntityDto | undefined> {
    // Regenerate the complete embedding vector for the updated text
    // Note: Embeddings cannot be partially updated - they must be fully regenerated
    // when the source text changes to maintain semantic accuracy
    const { embedding, dimensions } =
      await gcpAiPlatformLibrary.generateEmbedding(
        embeddingText,
        "RETRIEVAL_DOCUMENT",
        title
      );

    const updateData: UpdateEntityDto & {
      embeddingVector: VectorValue;
      embeddingGeneratedAt: string;
      embeddingModel: string;
      embeddingDimensions: number;
      embeddingOptimizedForSearch: boolean;
    } = {
      ...data,
      embeddingVector: FieldValue.vector(embedding),
      embeddingGeneratedAt: data.updatedAt,
      embeddingModel: this.MODEL_NAME,
      embeddingDimensions: dimensions,
      embeddingOptimizedForSearch: true,
    };

    global.logger.info("Updated document with new embedding", {
      documentId: id,
      embeddingDimensions: dimensions,
      textLength: embeddingText.length,
    });

    return gcpFirestoreLibrary.updateDocumentById<
      UpdateEntityDto & {
        embeddingVector: VectorValue;
        embeddingGeneratedAt: string;
        embeddingModel: string;
        embeddingDimensions: number;
        embeddingOptimizedForSearch: boolean;
      },
      DbEntityDto
    >(commonDbDetails, id, updateData);
  }

  /*
  async getDocumentsByEmbedding<DbEntityDto>(
    commonDbDetails: GcpFirestoreInteractionDto,
    queryText: string,
    options?: {
      limit?: number;
      page?: number;
      additionalFilters?: {
        field: string;
        operator: FirebaseFirestore.WhereFilterOp;
        value: any;
      }[];
      distanceThreshold?: number;
    }
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbEntityDto[]>> {
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const additionalFilters = options?.additionalFilters;
    const distanceThreshold = options?.distanceThreshold;

    // Generate embedding for the query text with RETRIEVAL_QUERY task type
    const { embedding } = await gcpAiPlatformLibrary.generateEmbedding(
      queryText,
      "RETRIEVAL_QUERY"
    );
    const db: Firestore = await gcpFirestoreLibrary.getFirestoreDatabase(
      commonDbDetails.databaseName
    );

    let query: Query = db.collection(
      commonDbDetails.collectionName
    );

    // Apply additional filters if provided
    if (additionalFilters && additionalFilters.length > 0) {
      additionalFilters.forEach((filter) => {
        query = query.where(filter.field, filter.operator, filter.value);
      });
    }

    // Fetch more results than needed for pagination
    // We need to fetch all results up to the current page to properly paginate
    const fetchLimit = limit * page + 1; // +1 to check if there are more results

    // Use Firestore's native vector search with findNearest (updated API)
    const vectorQuery: VectorQuery<DocumentData, DocumentData> = query.findNearest({
      vectorField: "embeddingVector",
      queryVector: embedding,
      limit: limit,
      distanceMeasure: "COSINE",
    });

    const snapshot: VectorQuerySnapshot<DocumentData, DocumentData> = await vectorQuery.get();

    const allResults: DbEntityDto[] = [];

    snapshot.forEach(
      (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = doc.data() as DbEntityDto & { embeddingVector: number[] };

        // Calculate distance (lower distance = higher similarity = better match)
        const distance: number = this.calculateCosineDistance(
          embedding,
          data.embeddingVector
        );

        // Calculate similarity score (0-100, higher is better)
        // const score: number = Math.max(0, Math.min(100, (1 - distance) * 100));

        // Apply distance threshold if provided
        if (!distanceThreshold || distance <= distanceThreshold) {
          allResults.push(data);
        }
      }
    );

    // Results are already sorted by distance (best matches first) from Firestore
    // But we'll ensure they're sorted by score (descending) for clarity
    // allResults.sort((a, b) => (a.score || 0) - (b.score || 0)).reverse();

    // Calculate pagination
    // const startIndex = (page - 1) * limit;
    // const endIndex = startIndex + limit;
    // const paginatedResults = allResults.slice(startIndex, endIndex);
    // const hasMore = allResults.length > endIndex;

    const pagination: GcpFirestoreRecordListingPaginationResponseDTO = {
      count: allResults.length,
      pageSize: limit,
      hasMore: allResults.length === fetchLimit ? true : false,
    };

    const response: GcpFirestoreRecordListingResponseDTO<DbEntityDto[]> = {
      data: allResults,
      pagination,
    };

    return response;
  }
  */

  async getDocumentsByEmbedding<DbEntityDto>(
    commonDbDetails: GcpFirestoreInteractionDto,
    queryText: string,
    filterOptions?: GcpFirestoreVectorRecordListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbEntityDto[]>> {
    global.logger.info("Getting documents by embedding", { 
      queryText,
      filterOptions
     });

    // Generate embedding for the query text with RETRIEVAL_QUERY task type
    const { embedding } = await gcpAiPlatformLibrary.generateEmbedding(
      queryText,
      "RETRIEVAL_QUERY"
    );
    global.logger.debug("Generated embedding for query text length", { 
      generatedEmbeddingLength: embedding.length
    });
    const db: Firestore = await gcpFirestoreLibrary.getFirestoreDatabase(
      commonDbDetails.databaseName
    );

    let query: Query = db.collection(
      commonDbDetails.collectionName
    );

    let limit: number = 10;

    // Apply additional filters if provided
    if (filterOptions && filterOptions?.preFilters && filterOptions.preFilters.length > 0) {
      limit = filterOptions.pageSize;
      filterOptions.preFilters.forEach(
        (filter: {
          field: string;
          operator: WhereFilterOp;
          value: string;
        }) => {
          query = query.where(filter.field, filter.operator, filter.value);
        }
      );
    }

    // Handle pagination with lastKey
    if (filterOptions?.lastKey) {
      const lastKeyDetails: {
        gcpFirestoreDocumentId: string;
      } | undefined = gcpFirestoreBase64EncodeStrToLastKey(filterOptions.lastKey);
      if(lastKeyDetails) {
        const { gcpFirestoreDocumentId } = lastKeyDetails;
        const docSnapshot: DocumentSnapshot<DocumentData, DocumentData> = await db
          .collection(commonDbDetails.collectionName)
          .doc(gcpFirestoreDocumentId)
          .get();
        query = query.startAfter(docSnapshot);
      }
    }

    // Use Firestore's native vector search with findNearest (updated API)
    const vectorQuery: VectorQuery<DocumentData, DocumentData> = query.findNearest({
      vectorField: "embeddingVector",
      queryVector: embedding,
      limit: limit,
      distanceMeasure: "COSINE",
      distanceThreshold: filterOptions?.distanceThreshold,
      distanceResultField: "embeddingVectorDistance",
    });

    const snapshot: VectorQuerySnapshot<DocumentData, DocumentData> = await vectorQuery.get();

    const allResults: DbEntityDto[] = [];

    snapshot.forEach(
      (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = doc.data() as DbEntityDto & { embeddingVector: { _values: number[] }, embeddingVectorDistance: number };

        // Calculate distance (lower distance = higher similarity = better match)
        const distance: number = data.embeddingVectorDistance;
        global.logger.debug("Calculated distance", { 
          calculatedCosineDistanceByFirestore: distance,
          givenDistanceThresholdInFilter: filterOptions?.distanceThreshold
        });

        allResults.push(data);
      }
    );

    const lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | undefined = 
      snapshot.docs[snapshot.docs.length - 1];

    const pagination: GcpFirestoreRecordListingPaginationResponseDTO = {
      count: allResults.length,
      pageSize: limit,
      lastKey: allResults.length === limit && lastDoc ? gcpFirestorelastKeyToBase64EncodeStr({
        gcpFirestoreDocumentId: lastDoc.id
      }) : undefined,
    };

    const response: GcpFirestoreRecordListingResponseDTO<DbEntityDto[]> = {
      data: allResults,
      pagination,
    };

    return response;
  }

  /**
   * Smart update: Only regenerates embedding if the text has actually changed
   * This is an optimization to avoid unnecessary API calls
   */
  async updateDocumentWithEmbeddingIfChanged<
    UpdateEntityDto extends DocumentData,
    DbEntityDto
  >(
    commonDbDetails: GcpFirestoreInteractionDto,
    id: string,
    data: UpdateEntityDto,
    newEmbeddingText: string,
    oldEmbeddingText?: string,
    title?: string
  ): Promise<DbEntityDto | undefined> {
    // If text hasn't changed, skip embedding regeneration
    if (oldEmbeddingText && oldEmbeddingText === newEmbeddingText) {
      global.logger.info("Text unchanged, skipping embedding regeneration", {
        documentId: id,
      });

      return gcpFirestoreLibrary.updateDocumentById<
        UpdateEntityDto,
        DbEntityDto
      >(commonDbDetails, id, data);
    }

    // Text changed, regenerate embedding
    return this.updateDocumentWithEmbedding<UpdateEntityDto, DbEntityDto>(
      commonDbDetails,
      id,
      data,
      newEmbeddingText,
      title
    );
  }
}

/**
 * @description Gcp Firestore Vector Search Library - Combines Firestore + AI Platform for embedding-based operations.
 * 
 * @note According to our conventions the SDK instances go in gcp-sdk.config.ts, but this library
 * interacts with multiple services and provides business logic beyond basic SDK operations.
 */
const gcpFirestoreVectorLibrary: GcpFirestoreVectorLibrary = new GcpFirestoreVectorLibrary();
export { 
  GcpFirestoreVectorLibrary, 
  gcpFirestoreVectorLibrary 
};
