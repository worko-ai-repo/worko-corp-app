
// Import google cloud firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import daos
import { centralCandidateProfileDaoObj } from "../daos/CentralCandidateProfile.dao";

// Import dtos
import { CentralCandidateProfileBulkCvPsuToUploadApiDto, CentralCandidateProfileDbPhoneNumberDto, CentralCandidateProfileListingFilterOptions } from "../dtos/CentralCandidateProfile.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import { SqsMsgCvExtractedParsedDto } from "../dtos/SqsEvent.dto";

// Import helpers
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";
import { getActionByUserId } from "../helpers/user.helper";

// Import models
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Import services
import { fileServiceObj } from "./File.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import UlidService from "./Ulid.service";
import { dateHelperObj } from "../helpers/date.helper";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";
import { candidateParsedCvServiceObj } from "./CandidateParsedCv.service";

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

  async getDuplicateCentralCandidateProfile(
    candidateEmailId: string,
    phoneNumberDetails: CentralCandidateProfileDbPhoneNumberDto
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info(`Get Duplicate Central Candidate Profile [Service]`, {
      methodName: this.getDuplicateCentralCandidateProfile.name,
    });

    return centralCandidateProfileDaoObj.getDuplicateCentralCandidateProfile(
      candidateEmailId,
      phoneNumberDetails
    );
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

  async generatePsuToBulkCvUploadCentralCandidateProfile(requestBody: CentralCandidateProfileBulkCvPsuToUploadApiDto) {
    return fileServiceObj.generatePsuToBulkCvUploadCentralCandidateProfile(requestBody);
  }

  async validateCentralCandidateProfileBulkUpload(
    candidateCvAwsS3FileName: string,
    cvExtractedParsed: SqsMsgCvExtractedParsedDto
  ) {
    const {
      candidateNumber,
      candidatePhoneCountryCode,
      candidateName,
      candidateNoticePeriod,
      isNoticePeriodNegotiable,
      about,
      education,
      candidateEmail,
      candidateLocation,
      candidateCurrentCompany,
      candidateCurrentDesignation,
      candidateRelevantYOE,
      candidateTotalYOE,
      candidateExpectedCTC,
      candidateCurrentCTC,
      candidateReadyToRelocate,
      coreSkills,
      technicalSkills,
      userPreferredDepartments,
      userPreferredIndustries,
      userPreferredlocations,
      userPreferredRoles
    } = cvExtractedParsed;

    // Get existing candidate data from `CentralCandidateProfile` model
    const existingCentralCandidateProfile: QuerySnapshot<DocumentData, DocumentData> =
      await this.getDuplicateCentralCandidateProfile(
        candidateEmail,
        {
          number: candidateNumber,
          countryCode: candidatePhoneCountryCode
        }
      );
    if(!existingCentralCandidateProfile.empty) {
      return false;
    } else {
      const currentDate: string = dateHelperObj.getISODate();
      // Prepare Create candidate parsed CV
      const candidateParsedCvCreateData: DbCandidateParsedCvDto = {
        id: UlidService.getUlidId(),
        createdAt: currentDate,
        updatedAt: currentDate,
        name: candidateName.toLowerCase(),
        email: candidateEmail.toLowerCase(),
        phoneNumberDetails: {
          number: candidateNumber,
          countryCode: candidatePhoneCountryCode,
        },
        about,
        education,
        currentCompany: candidateCurrentCompany,
        currentDesignation: candidateCurrentDesignation,
        totalYOE: candidateTotalYOE,
        relevantYOE: candidateRelevantYOE,
        currentCTC: candidateCurrentCTC,
        expectedCTC: candidateExpectedCTC,
        noticePeriod: candidateNoticePeriod,
        location: candidateLocation?.toLowerCase(),
        readyToRelocate: candidateReadyToRelocate,
        coreSkills: coreSkills,
        technicalSkills: technicalSkills,
        userPreferredDepartments: userPreferredDepartments,
        userPreferredIndustries: userPreferredIndustries,
        userPreferredlocations: userPreferredlocations,
        userPreferredRoles: userPreferredRoles,
        cvAwsS3ResourceType:
          CandidateParsedCvAwsS3ResourceTypeEnum.ADMIN_CAND_BULK_CV_UPLOAD,
        cvAwsS3BucketName: process.env
          .APP_AWS_S3_BUCKET_WORKO_ADMIN_CAND_PROFILE as string,
        cvAwsS3FilePath:
          APP_CONSTANTS.AWS_S3_DIR_PATHS.ADMIN_CAND_BULK_CV_UPLOAD,
        cvAwsS3FileName: candidateCvAwsS3FileName,
        cvAwsS3FileTracker: [
          {
            actionDate: currentDate,
            resourceType: CandidateParsedCvAwsS3ResourceTypeEnum.ADMIN_CAND_BULK_CV_UPLOAD,
            bucketName: process.env
              .APP_AWS_S3_BUCKET_WORKO_ADMIN_CAND_PROFILE as string,
            filePath:
              APP_CONSTANTS.AWS_S3_DIR_PATHS.ADMIN_CAND_BULK_CV_UPLOAD,
            fileName: candidateCvAwsS3FileName,
          },
        ],
        isNoticePeriodNegotiable,
      };
      
      let createCentralCandidateProfileData: DbCentralCandidateProfileDto = {
        id: candidateEmail,
        createdAt: currentDate,
        updatedAt: currentDate,
        candidateEmail: candidateEmail,
        phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails,
        refereeType: CentralCandidateProfileDbRefereeTypeEnum.INTERNAL,
        candidateParsedCvIds: [candidateParsedCvCreateData.id],
        latestCandidateParsedCvId: candidateParsedCvCreateData.id,
      };

      const result = await Promise.all([
        this.createCentralCandidateProfile(createCentralCandidateProfileData),
        candidateParsedCvServiceObj.createCandidateParsedCvWithEmbedding(candidateParsedCvCreateData)
      ]);

      if(result.length) {
        return true;
      }

      return false;
    }
  }
}

const centralCandidateProfileServiceObj = new CentralCandidateProfileService();
export { centralCandidateProfileServiceObj, CentralCandidateProfileService };