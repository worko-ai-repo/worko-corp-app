// Import firestore package
import { DocumentData, Firestore, Query } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";
import APP_CONSTANTS from "../configs/constants.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { CandidateJobMatchingListingFilterOptions } from "../dtos/CandidateJobMatching.dto";
import { AgencyJobAssignmentListingFilterOptions } from "../dtos/AgencyJobAssignment.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import models
import { DbCandidateJobMatchingDto } from "../db/gcp-firestore-models/CandidateJobMatching.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class CandidateJobMatchingDao implements BaseDao {
  constructor() {
    if(!process.env.APP_STAGE) throw new BaseError("APP_STAGE is not defined in .env file.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
  }

  databaseName: string = APP_CONSTANTS.STAGES.PROD === process.env.APP_STAGE ? "worko-corp-db-prod" : "worko-corp-db-dev";
  collectionName: string = "candidateJobMatchings";

  getCandidateJobMatchingModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getCandidateJobMatchingFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createCandidateJobMatching(createData: DbCandidateJobMatchingDto): Promise<DbCandidateJobMatchingDto | undefined> {
    global.logger.info(`Create Candidate Job Matching [DAO]`, {
      methodName: this.createCandidateJobMatching.name,
    });

    return gcpFirestoreLibrary.createDocument<DbCandidateJobMatchingDto>(
      this.getCandidateJobMatchingModelDetails(),
      createData
    );
  }

  async getCandidateJobMatchingById(id: string): Promise<DbCandidateJobMatchingDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbCandidateJobMatchingDto>(
      this.getCandidateJobMatchingModelDetails(),
      id
    );
  }

  async getAllCandidateJobMatchingByFilterOptions(filterOptions: CandidateJobMatchingListingFilterOptions) {
    const db: Firestore = await this.getCandidateJobMatchingFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    );

    if (filterOptions.candidateJobMatchingIds) {
      baseQuery = baseQuery.where(
        "id",
        "in",
        filterOptions.candidateJobMatchingIds
      );
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyJobAssignmentListingFilterOptions,
      DbCandidateJobMatchingDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

const candidateJobMatchingDaoObj = new CandidateJobMatchingDao();
export { candidateJobMatchingDaoObj, CandidateJobMatchingDao };