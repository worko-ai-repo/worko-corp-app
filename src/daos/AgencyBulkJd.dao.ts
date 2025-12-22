
// Import firestore package
import { DocumentData, Firestore, Query } from "@google-cloud/firestore";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import DTOs
import {
  AgencyBulkJdCreateDto,
  AgencyBulkJdFilterOptions,
} from "../dtos/AgencyBulkJd.dto";
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyBulkJdDto } from "../db/gcp-firestore-models/AgencyBulkJd.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

// Import services
import UlidService from "../services/Ulid.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

/**
 * AgencyBulkJdDao
 *
 * Data Access Object for Agency Bulk JD Firestore operations
 */
class AgencyBulkJdDao {
  constructor() {
    if(!process.env.APP_STAGE) throw new BaseError("APP_STAGE is not defined in .env file.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
  }

  databaseName: string =  APP_CONSTANTS.STAGES.PROD===process.env.APP_STAGE ? "worko-corp-db-prod" : `worko-corp-db-dev`;
  collectionName: string = "agencyBulkJds";

  getAgencyBulkJdModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyBulkJdFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createAgencyBulkJd(
    agencyBulkJdDto: AgencyBulkJdCreateDto
  ): Promise<DbAgencyBulkJdDto | undefined> {
    global.logger.info("Create Agency Bulk Job Description [DAO]", {
      methodName: this.createAgencyBulkJd.name,
      companyId: agencyBulkJdDto.companyId,
    });

    const currentTimestamp: string = dateHelperObj.getISODate();
    const agencyBulkJdId = UlidService.getUlidId();

    const agencyBulkJdData: DbAgencyBulkJdDto = {
      id: agencyBulkJdId,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      resumesCount: 0,
      ...agencyBulkJdDto,
    };

    return gcpFirestoreLibrary.createDocument<DbAgencyBulkJdDto>(
        this.getAgencyBulkJdModelDetails(),
        agencyBulkJdData
      );
  }

  /**
   * getAgencyBulkJdById
   *
   * Retrieves an agency bulk job description by ID
   */
  async getAgencyBulkJdById(
    agencyBulkJdId: string
  ): Promise<DbAgencyBulkJdDto | undefined> {
    global.logger.info("Get Agency Bulk Job Description by ID [DAO]", {
      methodName: this.getAgencyBulkJdById.name,
      agencyBulkJdId,
    });

    return gcpFirestoreLibrary.getDocumentById<DbAgencyBulkJdDto>(
      this.getAgencyBulkJdModelDetails(),
      agencyBulkJdId
    );
  }

  /**
   * updateAgencyBulkJdById
   *
   * Updates an agency bulk job description by ID
   */
  async updateAgencyBulkJdById(
    agencyBulkJdId: string,
    updateData: Partial<DbAgencyBulkJdDto>
  ): Promise<DbAgencyBulkJdDto | undefined> {
    global.logger.info("Update Agency Bulk Job Description by ID [DAO]", {
      filePath: __filename,
      methodName: this.updateAgencyBulkJdById.name,
      agencyBulkJdId,
    });

    const updatePayload: Partial<DbAgencyBulkJdDto> = {
      ...updateData,
      updatedAt: dateHelperObj.getISODate(),
    };

    return gcpFirestoreLibrary.updateDocumentById<
      Partial<DbAgencyBulkJdDto>,
      DbAgencyBulkJdDto
    >(this.getAgencyBulkJdModelDetails(), agencyBulkJdId, updatePayload);
  }

  async getAllAgencyBulkJdByFilterOptions(
    filterOptions: AgencyBulkJdFilterOptions,
    agencyUserDetails: DbAgencyUserDto
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyBulkJdDto[]>> {
    global.logger.info(
      "Get All Agency Bulk Job Descriptions by Filter Options [DAO]",
      {
        methodName: this.getAllAgencyBulkJdByFilterOptions.name,
        filterOptions,
      }
    );

    const { companyId, sortOrder } = filterOptions;

    const db: Firestore = await this.getAgencyBulkJdFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    ).where("agencyRegisteredEmail", "==", agencyUserDetails.email);

    if (companyId) baseQuery = baseQuery.where("companyId", "==", companyId);

    if (sortOrder) baseQuery = baseQuery.orderBy("createdAt", sortOrder);

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyBulkJdFilterOptions,
      DbAgencyBulkJdDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

// Create an instance and export
const agencyBulkJdDaoObj = new AgencyBulkJdDao();
export { agencyBulkJdDaoObj, AgencyBulkJdDao };
