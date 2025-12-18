
// Import firestore package
import { Firestore } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";
import APP_CONSTANTS from "../configs/constants.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { CandidateParsedCvCorpEmbeddingListingFilterOptions } from "../dtos/CandidateParsedCv.dto";
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
      embeddingText
    );
  }

  async getAllCandidateParsedCvsByIdsWithoutPagination(candidateParsedCvIds: string[]): Promise<DbCandidateParsedCvDto[]> {
    return gcpFirestoreLibrary.getAllDocumentsByIdsWithoutPagination<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      candidateParsedCvIds
    );
  }

  async getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
    filterOptions: CandidateParsedCvCorpEmbeddingListingFilterOptions
  ): Promise<
    GcpFirestoreRecordListingResponseDTO<DbCandidateParsedCvDto[]>
  > {
    return gcpFirestoreVectorLibrary.getDocumentsByEmbedding<DbCandidateParsedCvDto>(
      candidateParsedCvDaoObj.getCandidateParsedCvModelDetails(),
      filterOptions.searchByPrompt as string,
      {
        preFilters: [
          {
            field: "companyId",
            operator: "==",
            value: filterOptions.companyId as string
          }
        ],
        pageSize: filterOptions.pageSize,
        distanceThreshold: 0.6
      },
    );
  }

  async getCandidateParsedCvById(id: string): Promise<DbCandidateParsedCvDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      id
    );
  }
}

const candidateParsedCvDaoObj = new CandidateParsedCvDao();
export { candidateParsedCvDaoObj, CandidateParsedCvDao };