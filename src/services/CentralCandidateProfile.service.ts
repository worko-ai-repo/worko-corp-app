

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import daos
import { centralCandidateProfileDaoObj } from "../daos/CentralCandidateProfile.dao";

// Import dtos
import { CentralCandidateProfileListingFilterOptions } from "../dtos/CentralCandidateProfile.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";
import { getActionByUserId } from "../helpers/user.helper";

// Import models
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CentralCandidateProfileService {
  async createCentralCandidateProfile(
    createData: DbCentralCandidateProfileDto
  ): Promise<DbCentralCandidateProfileDto | undefined> {
    global.logger.info(`Create Central Candidate Profile [Service]`, {
      methodName: this.createCentralCandidateProfile.name,
    });

    return centralCandidateProfileDaoObj.createCentralCandidateProfile(createData);
  }

  async getCentralCandidateProfileById(
    id: string // candidate email
  ): Promise<DbCentralCandidateProfileDto | undefined> {
    return centralCandidateProfileDaoObj.getCentralCandidateProfileById(id);
  }

  async updateCentralCandidateProfileById(
    id: string, // candidate email
    updateData: Partial<DbCentralCandidateProfileDto>
  ): Promise<DbCentralCandidateProfileDto | undefined> {
    return centralCandidateProfileDaoObj.updateCentralCandidateProfileById(id, updateData);
  }

  async performGetAllCentralCandidateProfileActivities(
    filterOptions: CentralCandidateProfileListingFilterOptions
  ) {
    const {actionByUserId} = getActionByUserId();
    const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

    if(!actionByUserId || !cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)) {
      global.logger.error(`Only Admins can access this API`, {
        methodName: this.performGetAllCentralCandidateProfileActivities.name,
        error: "Unauthorized Access"
      });

      throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
    }

    // If candidate parsed cv details are not required then list without them.
    if (!filterOptions.includeCandidateParsedCvDetails) {
      return this.getAllCentralCandidateProfileByFilterOptions(filterOptions);
    }

    const { data: centralCandidateProfiles, pagination } = await this.getAllCentralCandidateProfileByFilterOptions(
      filterOptions
    );

    const centralCandidateProfilesWithCandidateParsedCvDetails: (DbCentralCandidateProfileDto & {
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[] = await injectEntityDetailsHelperObj.injectEntityDetailsForCentralCandidateProfiles(
      centralCandidateProfiles,
      filterOptions.includeCandidateParsedCvDetails,
    );

    const finalResponse: GcpFirestoreRecordListingResponseDTO<(
      DbCentralCandidateProfileDto & {
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      }
    )[]> = {
      data: centralCandidateProfilesWithCandidateParsedCvDetails,
      pagination,
    };

    return finalResponse;
  }

  async getAllCentralCandidateProfileByFilterOptions(
    filterOptions: CentralCandidateProfileListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbCentralCandidateProfileDto[]>> {
    return centralCandidateProfileDaoObj.getAllCentralCandidateProfileByFilterOptions(
      filterOptions
    );
  }
}

const centralCandidateProfileServiceObj = new CentralCandidateProfileService();
export { centralCandidateProfileServiceObj, CentralCandidateProfileService };