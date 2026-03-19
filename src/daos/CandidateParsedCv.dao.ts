
// Import firestore package
import { DocumentData, Firestore, QueryDocumentSnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";
import APP_CONSTANTS from "../configs/constants.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { CandidateParsedCvAdminEmbeddingListingFilterOptions, CandidateParsedCvCorpEmbeddingListingFilterOptions } from "../dtos/CandidateParsedCv.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import libraries
import { gcpFirestoreVectorLibrary } from "../libraries/gcp-firestore-vector.library";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";


class CandidateParsedCvDao implements BaseDao {
  constructor() {
    if(!process.env.APP_STAGE) throw new BaseError("APP_STAGE is not defined in .env file.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
  }

  databaseName: string =  APP_CONSTANTS.STAGES.PROD===process.env.APP_STAGE ? "worko-corp-db-prod" : `worko-corp-db-dev`;
  collectionName: string = "candidateParsedCvs";

  getCandidateParsedCvModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getCandidateParsedCvFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createCandidateParsedCvWithEmbedding(createData: DbCandidateParsedCvDto, embeddingText: string): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Create Candidate Parsed CV [DAO]`, {
      methodName: this.createCandidateParsedCvWithEmbedding.name,
    });

    return gcpFirestoreVectorLibrary.createDocumentWithEmbedding<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      createData,
      embeddingText,
    );
  }

  async getAllCandidateParsedCvsByIdsWithoutPagination(candidateParsedCvIds: string[]): Promise<DbCandidateParsedCvDto[]> {
    return gcpFirestoreLibrary.getAllDocumentsByIdsWithoutPagination<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      candidateParsedCvIds
    );
  }

  async getAllCandidateParsedCvByAdminEmbeddingFilterOptions(
    filterOptions: CandidateParsedCvAdminEmbeddingListingFilterOptions,
    distanceThreshold: number,
    searchByJobDescription?: string
  ) {
    if(!filterOptions.searchByPrompt && !searchByJobDescription) throw new BaseError("Search by prompt or job description is required.", HttpStatusCode.BAD_REQUEST_400);

    let searchPrompt: string = searchByJobDescription ? searchByJobDescription : (filterOptions.searchByPrompt as string);

    return gcpFirestoreVectorLibrary.getDocumentsByEmbedding<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      searchPrompt,
      {
        pageSize: filterOptions.pageSize,
        pageNumber: filterOptions.pageNumber,
        distanceThreshold,
      },
    );
  }

  async getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
    filterOptions: CandidateParsedCvCorpEmbeddingListingFilterOptions,
    distanceThreshold: number,
    companyId: string,
    searchByJobDescription?: string
  ): Promise<
    GcpFirestoreRecordListingResponseDTO<QueryDocumentSnapshot<DocumentData, DocumentData>[]>
  > {
    if(!companyId) throw new BaseError("You Can only list candidates for particular your company.", HttpStatusCode.BAD_REQUEST_400);
    if(!filterOptions.searchByPrompt && !searchByJobDescription) throw new BaseError("Search by prompt or job description is required.", HttpStatusCode.BAD_REQUEST_400);

    let searchPrompt: string = searchByJobDescription ? searchByJobDescription : (filterOptions.searchByPrompt as string);

    return gcpFirestoreVectorLibrary.getDocumentsByEmbedding<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      searchPrompt,
      {
        preFilters: [
          {
            field: "companyId",
            operator: "==",
            value: companyId
          }
        ],
        pageSize: filterOptions.pageSize,
        pageNumber: filterOptions.pageNumber,
        distanceThreshold,
      },
    );
  }

  async getCandidateParsedCvById(id: string): Promise<DbCandidateParsedCvDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      id
    );
  }

  async getCandidateParsedCvByCandEmail(candidateEmail: string) {
    const db = await this.getCandidateParsedCvFirestoreDatabase();

    return db.collection(this.collectionName).where("email", "==", candidateEmail).get();
  }

  async updateCandidateParsedCvById(
    id: string,
    updateData: Partial<DbCandidateParsedCvDto>,
  ): Promise<DbCandidateParsedCvDto | undefined> {
    return gcpFirestoreLibrary.updateDocumentById<
      Partial<DbCandidateParsedCvDto>,
      DbCandidateParsedCvDto
    >(this.getCandidateParsedCvModelDetails(), id, updateData);
  }

  async updateCandidateParsedCvWithEmbedding(
    id: string,
    updateData: Partial<DbCandidateParsedCvDto>,
    embeddingText: string,
  ): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Update Candidate Parsed CV with Embedding [DAO]`, {
      methodName: this.updateCandidateParsedCvWithEmbedding.name,
    });

    return gcpFirestoreVectorLibrary.updateDocumentWithEmbedding<
      Partial<DbCandidateParsedCvDto>,
      DbCandidateParsedCvDto
    >(this.getCandidateParsedCvModelDetails(), id, updateData, embeddingText);
  }
}

const candidateParsedCvDaoObj = new CandidateParsedCvDao();
export { candidateParsedCvDaoObj, CandidateParsedCvDao };