
// Import firestore package
import { Firestore, DocumentData, QuerySnapshot, QueryDocumentSnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary, gcpVertexAiLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { VectorQueryResult } from "../dtos/Common.gcp-firestore-vector.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import utils
import { BaseError } from "../utils/errors.util";

class GcpFirestoreVectorLibrary {
  constructor() {
    if(!process.env.APP_GCP_VERTEX_AI_MODEL_NAME) {
      throw new BaseError("APP_GCP_VERTEX_AI_MODEL_NAME is not defined in .env file.");
    }
  }

  async createDocumentWithEmbedding<DbEntityDto extends DocumentData>(
    commonDbDetails: GcpFirestoreInteractionDto,
    data: DbEntityDto,
    embeddingText: string
  ): Promise<DbEntityDto | undefined> {
    const { embedding, dimensions } = await gcpVertexAiLibrary.generateEmbedding(
      embeddingText
    );

    const documentWithEmbedding: DbEntityDto & {
      embeddingVector: number[];
      embeddingGeneratedAt: string;
      embeddingModel: string;
      embeddingDimensions: number;
      embeddingOptimizedForSearch: boolean;
    } = {
      ...data,
      embeddingVector: embedding,
      embeddingGeneratedAt: dateHelperObj.getISODate(),
      embeddingModel: process.env.APP_GCP_VERTEX_AI_MODEL_NAME as string,
      embeddingDimensions: dimensions,
      embeddingOptimizedForSearch: true,
    };

    return gcpFirestoreLibrary.createDocument<
      DbEntityDto & {
        embeddingVector: number[];
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
    embeddingText: string
  ): Promise<DbEntityDto | undefined> {
    const { embedding, dimensions } = await gcpVertexAiLibrary.generateEmbedding(
      embeddingText
    );

    const updateData: UpdateEntityDto & {
      embeddingVector: number[];
      embeddingGeneratedAt: string;
      embeddingModel: string;
      embeddingDimensions: number;
      embeddingOptimizedForSearch: boolean;
    } = {
      ...data,
      embeddingVector: embedding,
      embeddingGeneratedAt: dateHelperObj.getISODate(),
      embeddingModel: process.env.APP_GCP_VERTEX_AI_MODEL_NAME as string,
      embeddingDimensions: dimensions,
      embeddingOptimizedForSearch: true,
    };

    return gcpFirestoreLibrary.updateDocumentById<
      UpdateEntityDto & {
        embeddingVector: number[];
        embeddingGeneratedAt: string;
        embeddingModel: string;
        embeddingDimensions: number;
        embeddingOptimizedForSearch: boolean;
      },
      DbEntityDto
    >(commonDbDetails, id, updateData);
  }

  async getDocumentsByEmbedding<DbEntityDto>(
    commonDbDetails: GcpFirestoreInteractionDto,
    queryText: string,
    limit: number = 10
  ): Promise<VectorQueryResult<DbEntityDto>[]> {
    const { embedding } = await gcpVertexAiLibrary.generateEmbedding(queryText);
    const db: Firestore = gcpFirestoreLibrary.getFirestoreDatabase(
      commonDbDetails.databaseName
    );

    const snapshot: QuerySnapshot<DocumentData, DocumentData> = await db
      .collection(commonDbDetails.collectionName)
      .orderBy("embeddingVector")
      .limit(limit)
      .get();

    const results: VectorQueryResult<DbEntityDto>[] = [];

    snapshot.forEach(
      (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
        const data = doc.data() as DbEntityDto & { embeddingVector: number[] };
        if (data.embeddingVector) {
          const distance: number = this.calculateCosineDistance(
            embedding,
            data.embeddingVector
          );
          results.push({
            document: data,
            distance,
          });
        }
      }
    );

    return results
      .sort(
        (
          a: VectorQueryResult<DbEntityDto>,
          b: VectorQueryResult<DbEntityDto>
        ) => a.distance - b.distance
      )
      .slice(0, limit);
  }

  private calculateCosineDistance(vec1: number[], vec2: number[]): number {
    let dotProduct: number = 0;
    let norm1: number = 0;
    let norm2: number = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const similarity: number =
      dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return 1 - similarity;
  }
}

/**
 * @description Gcp Firestore Vector Search Library - Combines Firestore + Vertex AI for embedding-based operations.
 * 
 * @note According to our conventions the SDK instances go in gcp-sdk.config.ts, but this composite library
 * orchestrates multiple services and provides business logic beyond basic SDK operations.
 */
const gcpFirestoreVectorLibrary = new GcpFirestoreVectorLibrary();

export { GcpFirestoreVectorLibrary, gcpFirestoreVectorLibrary };
