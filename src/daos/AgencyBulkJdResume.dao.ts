
// Import firestore package
import { DocumentData, Firestore, Query } from "@google-cloud/firestore";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import DTOs
import {
  AgencyBulkJdResumeFilterOptions,
} from "../dtos/AgencyBulkJdResume.dto";
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import models
import { DbAgencyBulkJdResumeDto } from "../db/gcp-firestore-models/AgencyBulkJdResume.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

/**
 * AgencyBulkJdResumeDao
 *
 * Data Access Object for Agency Bulk JD Resume Firestore operations
 */
class AgencyBulkJdResumeDao {
  constructor() {
    if(!process.env.APP_STAGE) throw new BaseError("APP_STAGE is not defined in .env file.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
  }

  databaseName: string =  APP_CONSTANTS.STAGES.PROD===process.env.APP_STAGE ? "worko-corp-db-prod" : `worko-corp-db-dev`;
  collectionName: string = "agencyBulkJdResumes";

  getAgencyBulkJdResumeModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyBulkJdResumeFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createBulkAgencyBulkJdResume(
    documents: DbAgencyBulkJdResumeDto[]
  ): Promise<boolean> {
    global.logger.info(`Create Multiple Bulk Agency Job Assignment [DAO]`, {
      methodName: this.createBulkAgencyBulkJdResume.name,
    });

    return gcpFirestoreLibrary.bulkCreateDocument<DbAgencyBulkJdResumeDto>(
      this.getAgencyBulkJdResumeModelDetails(),
      documents
    );
  }

  /**
   * getAgencyBulkJdResumeById
   *
   * Retrieves an agency bulk JD resume by ID
   */
  async getAgencyBulkJdResumeById(
    resumeId: string
  ): Promise<DbAgencyBulkJdResumeDto | undefined> {
    global.logger.info("Get Agency Bulk JD Resume by ID [DAO]", {
      filePath: __filename,
      methodName: this.getAgencyBulkJdResumeById.name,
      resumeId,
    });

    return gcpFirestoreLibrary.getDocumentById<DbAgencyBulkJdResumeDto>(
      this.getAgencyBulkJdResumeModelDetails(),
      resumeId
    );
  }

  async getAllAgencyBulkJdResumesByFilterOptions(
    filterOptions: AgencyBulkJdResumeFilterOptions,
    agencyUserDetails: DbAgencyUserDto
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyBulkJdResumeDto[]>> {
    global.logger.info(
      "Get All Agency Bulk JD Resumes by Filter Options [DAO]",
      {
        methodName: this.getAllAgencyBulkJdResumesByFilterOptions.name,
        filterOptions,
      }
    );

    const {  agencyBulkJdId, sortOrder } = filterOptions;

    const db: Firestore = await this.getAgencyBulkJdResumeFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db
      .collection(this.collectionName)
      .where("agencyRegisteredEmail", "==", agencyUserDetails.email)
      .where("agencyBulkJdId", "==", agencyBulkJdId);

    if(sortOrder) baseQuery = baseQuery.orderBy("createdAt", sortOrder);

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyBulkJdResumeFilterOptions,
      DbAgencyBulkJdResumeDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

// Create an instance and export
const agencyBulkJdResumeDaoObj = new AgencyBulkJdResumeDao();
export { agencyBulkJdResumeDaoObj, AgencyBulkJdResumeDao };
