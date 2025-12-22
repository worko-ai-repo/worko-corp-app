// import daos
import { agencyBulkJdDaoObj } from "../daos/AgencyBulkJd.dao";

// import dtos
import {
  AgencyBulkJdFilterOptions,
  AgencyBulkJdCreateApiDto,
  AgencyBulkJdCreateDto
} from "../dtos/AgencyBulkJd.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// import models
import { DbAgencyBulkJdDto } from "../db/gcp-firestore-models/AgencyBulkJd.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

// import services
import { agencyUserServiceObj } from "./AgencyUser.service";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyBulkJdService {
  async performCreateAgencyBulkJdApiActivities(
    requestBody: AgencyBulkJdCreateApiDto,
  ): Promise<DbAgencyBulkJdDto | undefined> {

    const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.validateAgencyUserAuthAccess();
    if(!agencyUserDetails) {
      global.logger.error(`Agency User not found. [CONTROLLER]`, {
        methodName: this.createAgencyBulkJd.name,
        requestBody,
        agencyUserDetails,
      });
      throw new BaseError(
        "Unauthorized.",
        HttpStatusCode.UNAUTHORIZED_401
      );
    }

    const createData: AgencyBulkJdCreateDto = {
      ...requestBody,
      agencyRegisteredEmail: agencyUserDetails.email,
      createdByAgencyUserId: agencyUserDetails.id,

    };
    return this.createAgencyBulkJd(createData);
  }

  async createAgencyBulkJd(
    agencyBulkJdDto: AgencyBulkJdCreateDto
  ): Promise<DbAgencyBulkJdDto | undefined> {
    // logger
    global.logger.info("Create Agency Bulk Job Description [Service]", {
      methodName: this.createAgencyBulkJd.name,
      companyId: agencyBulkJdDto.companyId,
    });

    // agency bulk jd details
    return agencyBulkJdDaoObj.createAgencyBulkJd(agencyBulkJdDto);
  }

  async getAllAgencyBulkJdByFilterOptions(
    filterOptions: AgencyBulkJdFilterOptions,
    agencyUserDetails: DbAgencyUserDto
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyBulkJdDto[]>> {
    // logger
    global.logger.info("Get all Agency Bulk Job Description [Service]", {
      methodName: this.getAllAgencyBulkJdByFilterOptions.name,
    });

    // Get all the bulk jd details with pagination
    return agencyBulkJdDaoObj.getAllAgencyBulkJdByFilterOptions(
      filterOptions,
      agencyUserDetails
    );
  }

  async getAgencyBulkJdById(
    agencyBulkJdId: string
  ): Promise<DbAgencyBulkJdDto | undefined> {
    // logger
    global.logger.info("Get Agency Bulk Job Description by id [Service]", {
      methodName: this.getAgencyBulkJdById.name,
      agencyBulkJdId: agencyBulkJdId,
    });

    // get agency bulk jd and Throw error if the data not found
    return agencyBulkJdDaoObj.getAgencyBulkJdById(
      agencyBulkJdId
    );
  }

  async updateAgencyBulkJdById(
    agencyBulkJdId: string,
    bulkJdUpdatedDetails: Partial<DbAgencyBulkJdDto>
  ): Promise<DbAgencyBulkJdDto | undefined> {
    // logger
    global.logger.info("Update Agency Bulk JD Details by ID [Service]", {
      methodName: this.updateAgencyBulkJdById.name,
      agencyBulkJdId,
    });

    // Update Agency Bulk Jd Details and return
    return agencyBulkJdDaoObj.updateAgencyBulkJdById(
      agencyBulkJdId,
      bulkJdUpdatedDetails
    );
  }
}

// Create an instance of the AgencyBulkJdService class and export it
const agencyBulkJdServiceObj = new AgencyBulkJdService();
export { agencyBulkJdServiceObj, AgencyBulkJdService };
