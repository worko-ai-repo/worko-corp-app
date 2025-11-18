// Import google cloud firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import { corporateCandidateProfileDaoObj } from "../daos/CorporateCandidateProfile.dao";

// Import dtos
import { CorporateCandidateProfileDbPhoneNumberDto, CorporateCandidateProfileListingFilterOptions } from "../dtos/CorporateCandidateProfile.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { getActionByUserId } from "../helpers/user.helper";
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";

// Import models
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Import services
import { corporateUserServiceObj } from "./CorporateUser.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CorporateCandidateProfileService {
  async createCorporateCandidateProfile(
    createData: DbCorporateCandidateProfileDto
  ): Promise<DbCorporateCandidateProfileDto | undefined> {
    global.logger.info(`Create Corporate Candidate Profile [Service]`, {
      methodName: this.createCorporateCandidateProfile.name,
    });

    return corporateCandidateProfileDaoObj.createCorporateCandidateProfile(createData);
  }

  async getDuplicateCorporateCandidateProfile(
    companyId: string,
    candidateEmailId: string,
    phoneNumberDetails: CorporateCandidateProfileDbPhoneNumberDto
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info(`Get Duplicate Corporate Candidate Profile [Service]`, {
      methodName: this.getDuplicateCorporateCandidateProfile.name,
    });

    return corporateCandidateProfileDaoObj.getDuplicateCorporateCandidateProfile(
      companyId,
      candidateEmailId,
      phoneNumberDetails
    );
  }

  async performGetAllCorporateCandidateProfileActivities(
    filterOptions: CorporateCandidateProfileListingFilterOptions
  ): Promise<
    GcpFirestoreRecordListingResponseDTO<
      (DbCorporateCandidateProfileDto & {
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[]
    >
  > {
    const { actionByCorporateUserId } = getActionByUserId();

    /**
     * If action by user is "corporate-admin/recruiter", then list invites which are sent by him and from his company
     */
    if (actionByCorporateUserId) {
      if (!filterOptions.companyId) {
        global.logger.info(
          `To list corporate candidate profiles for particular corporate user, companyId is required`,
          {
            methodName: this.performGetAllCorporateCandidateProfileActivities.name,
            filterOptions,
          }
        );
        throw new BaseError(
          "Company id is required",
          HttpStatusCode.BAD_REQUEST_400
        );
      }

      const corporateUserDetails: QueryResponse<DbCorporateUserDto> =
        await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
      if (!corporateUserDetails.count) {
        throw new BaseError(
          `Corporate User Details not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }
      const corporateUserData: DbCorporateUserDto = corporateUserDetails[0];

      if (corporateUserData.isDeleted) {
        global.logger.error(`Corporate user account is deleted.`, {
          methodName: this.performGetAllCorporateCandidateProfileActivities.name,
          corporateUserData,
        });
        throw new BaseError(
          "You are not allowed to access this resource",
          HttpStatusCode.FORBIDDEN_403
        );
      }

      if (filterOptions.companyId !== corporateUserData.companyId) {
        global.logger.info(
          `To list corporate candidate profiles for particular corporate user, companyId should match`,
          {
            methodName: this.performGetAllCorporateCandidateProfileActivities.name,
            filterOptions,
            corporateUserData,
          }
        );
        throw new BaseError(
          "You are not allowed to access this resource",
          HttpStatusCode.FORBIDDEN_403
        );
      }
    } else {
      global.logger.info(
        `To list corporate candidate profiles for particular corporate user, actionByCorporateUserId is required`,
        {
          methodName: this.performGetAllCorporateCandidateProfileActivities.name,
          filterOptions,
        }
      );
      throw new BaseError(
        "Unauthorized.",
        HttpStatusCode.UNAUTHORIZED_401
      );
    }

    // If candidate parsed cv details are not required then list without them.
    if (!filterOptions.includeCandidateParsedCvDetails && !filterOptions.includeJobDetails) {
      return this.getAllCorporateCandidateProfileByFilterOptions(filterOptions);
    }

    const { data: corporateCandidateProfiles, pagination } =
      await this.getAllCorporateCandidateProfileByFilterOptions(filterOptions);

    const corporateCandidateProfilesWithEntityDetails: (DbCorporateCandidateProfileDto & {
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[] =
      await injectEntityDetailsHelperObj.injectEntityDetailsForCorporateCandidateProfiles(
        corporateCandidateProfiles,
        filterOptions.includeCandidateParsedCvDetails,
        filterOptions.includeJobDetails
      );

    const finalResponse: GcpFirestoreRecordListingResponseDTO<
      (DbCorporateCandidateProfileDto & {
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[]
    > = {
      data: corporateCandidateProfilesWithEntityDetails,
      pagination: pagination,
    };

    return finalResponse;
  }

  async getAllCorporateCandidateProfileByFilterOptions(
    filterOptions: CorporateCandidateProfileListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbCorporateCandidateProfileDto[]>> {
    return corporateCandidateProfileDaoObj.getAllCorporateCandidateProfileByFilterOptions(
      filterOptions
    );
  }
}

const corporateCandidateProfileServiceObj = new CorporateCandidateProfileService();
export { corporateCandidateProfileServiceObj, CorporateCandidateProfileService };