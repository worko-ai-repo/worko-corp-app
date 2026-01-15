// Import google cloud firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import daos
import { corporateCandidateProfileDaoObj } from "../daos/CorporateCandidateProfile.dao";

// Import dtos
import { CorporateCandidateProfileBulkCvPsuToUploadApiDto, CorporateCandidateProfileDbPhoneNumberDto, CorporateCandidateProfileListingFilterOptions } from "../dtos/CorporateCandidateProfile.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import { PreSignedUrlToUploadFileResponseDto } from "../dtos/File.dto";
import { SqsMsgCvExtractedParsedDto } from "../dtos/SqsEvent.dto";

// Import enums
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";
import { CorporateCandidateProfileDbRefereeTypeEnum } from "../enums/CorporateCandidateProfile.enum";

// Import helpers
import { getActionByUserId } from "../helpers/user.helper";
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";

// Import services
import { fileServiceObj } from "./File.service";
import { corporateUserServiceObj } from "./CorporateUser.service";
import UlidService from "./Ulid.service";
import { centralCandidateProfileServiceObj } from "./CentralCandidateProfile.service";
import { candidateParsedCvServiceObj } from "./CandidateParsedCv.service";
import { companyDetailServiceObj } from "./CompanyDetail.service";

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

  async generatePsuToBulkCvUploadCorporateCandidateProfile(requestBody: CorporateCandidateProfileBulkCvPsuToUploadApiDto): Promise<PreSignedUrlToUploadFileResponseDto[]> {
    global.logger.info(`Generate PSU To Bulk Cv Upload Corporate Candidate Profile [Service]`, {
      methodName: this.generatePsuToBulkCvUploadCorporateCandidateProfile.name,
    });
    const { actionByCorporateUserId } = getActionByUserId();
    if(!actionByCorporateUserId) {
      throw new BaseError(
        "Unauthorized.",
        HttpStatusCode.UNAUTHORIZED_401
      );
    }

    const corporateUserDetails: QueryResponse<DbCorporateUserDto> = await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
    if (!corporateUserDetails.count) {
      throw new BaseError(
        `Corporate User Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const corporateUserData: DbCorporateUserDto = corporateUserDetails[0];

    if(corporateUserData.isDeleted) {
      throw new BaseError(
        "Your account has been deleted, please contact support.",
        HttpStatusCode.FORBIDDEN_403
      );
    }

    if(requestBody.companyId !== corporateUserData.companyId) {
      global.logger.info(`Corporate user and company id in request mismatch.`, {
        methodName: this.generatePsuToBulkCvUploadCorporateCandidateProfile.name,
      })
      throw new BaseError(
        "You are not allowed to access this resource",
        HttpStatusCode.FORBIDDEN_403
      );
    }

    return fileServiceObj.generatePsuToBulkCvUploadCorporateCandidateProfile(requestBody);
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

  async validateCorporateCandidateProfileBulkUpload(
    companyId: string,
    candidateCvAwsS3FileName: string,
    cvExtractedParsed: SqsMsgCvExtractedParsedDto
  ) {
    const companyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(companyId);
    if (!companyDetails.count) {
      throw new BaseError(
        `Company details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const companyData: DbCompanyDetailDto = companyDetails[0];

    const {
      candidateNumber,
      candidatePhoneCountryCode,
      candidateName,
      candidateNoticePeriod,
      isNoticePeriodNegotiable,
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

    const existingCorporateCandidateProfile: QuerySnapshot<DocumentData, DocumentData> = await this.getDuplicateCorporateCandidateProfile(
      companyId,
      candidateEmail,
      {
        number: candidateNumber,
        countryCode: candidatePhoneCountryCode
      }
    );
    const currentDate: string = dateHelperObj.getISODate();
    if(!existingCorporateCandidateProfile.empty) {
      global.logger.info(`Duplicate candidate profile found.`, {
        methodName: this.validateCorporateCandidateProfileBulkUpload.name,
        existingCorporateCandidateProfileLength: existingCorporateCandidateProfile.docs.length,
      });
      return false;
    } else {
      // Prepare Create candidate parsed CV
      const candidateParsedCvCreateData: DbCandidateParsedCvDto = {
        id: UlidService.getUlidId(),
        createdAt: currentDate,
        updatedAt: currentDate,
        name: candidateName.toLowerCase(),
        email: candidateEmail.toLowerCase(),
        phoneNumberDetails: {
          number: candidateNumber,
          countryCode: candidatePhoneCountryCode
        },
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
        cvAwsS3ResourceType: CandidateParsedCvAwsS3ResourceTypeEnum.CORP_CAND_BULK_CV_UPLOAD,
        cvAwsS3BucketName: process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE_CAND_PROFILE as string,
        cvAwsS3FilePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.CORP_CAND_BULK_CV_UPLOAD.strtr({
          "{companyId}": companyId,
        }),
        cvAwsS3FileName: candidateCvAwsS3FileName,
        cvAwsS3FileTracker: [
          {
            actionDate: currentDate,
            resourceType: CandidateParsedCvAwsS3ResourceTypeEnum.CORP_CAND_BULK_CV_UPLOAD,
            bucketName: process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE_CAND_PROFILE as string,
            filePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.CORP_CAND_BULK_CV_UPLOAD.strtr({
              "{companyId}": companyId,
            }),
            fileName: candidateCvAwsS3FileName
          }
        ],
        isNoticePeriodNegotiable,
        companyId: companyId,
      };

      // Prepare Create corporate candidate profile
      const corporateCandidateProfileCreateData: DbCorporateCandidateProfileDto = {
        id: UlidService.getUlidId(),
        createdAt: currentDate,
        updatedAt: currentDate,
        companyId: companyId,
        candidateEmail: candidateEmail,
        refereeType: CorporateCandidateProfileDbRefereeTypeEnum.INTERNAL,
        phoneNumberDetails: {
          number: candidateNumber,
          countryCode: candidatePhoneCountryCode
        },
        candidateParsedCvId: candidateParsedCvCreateData.id, 
      };

      candidateParsedCvCreateData.corporateCandidateProfileId = corporateCandidateProfileCreateData.id;

      // Get existing candidate data from `CentralCandidateProfile` model
      const existingCentralCandidateProfile: DbCentralCandidateProfileDto | undefined =
        await centralCandidateProfileServiceObj.getCentralCandidateProfileById(
          candidateEmail
        );

      let createOrUpdateCentralCandidateProfile: Promise<DbCentralCandidateProfileDto | undefined>;

      if(existingCentralCandidateProfile) {
        createOrUpdateCentralCandidateProfile = centralCandidateProfileServiceObj.updateCentralCandidateProfileById(
          candidateEmail,
          {
            updatedAt: currentDate,
            candidateProfileInCompanies: [
              ...(existingCentralCandidateProfile?.candidateProfileInCompanies ?? []),
              {
                companyId: companyId,
                companyName: companyData.name.toUpperCase(),
              }
            ],
            corporateCandidateProfileIds: [
              ...(existingCentralCandidateProfile?.corporateCandidateProfileIds ?? []),
              corporateCandidateProfileCreateData.id
            ],
          }
        )
      } else {
        corporateCandidateProfileCreateData.candidateParsedCvId = candidateParsedCvCreateData.id;

        let createCentralCandidateProfileData: DbCentralCandidateProfileDto = {
          id: candidateEmail,
          createdAt: currentDate,
          updatedAt: currentDate,
          candidateEmail: candidateEmail,
          phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails,
          refereeType: CentralCandidateProfileDbRefereeTypeEnum.INTERNAL,
          candidateProfileInCompanies: [
            {
              companyId: companyId,
              companyName: companyData.name.toUpperCase(),
            },
          ],
          corporateCandidateProfileIds: [corporateCandidateProfileCreateData.id],
          candidateParsedCvIds: [candidateParsedCvCreateData.id],
          latestCandidateParsedCvId: candidateParsedCvCreateData.id,
        };
        createOrUpdateCentralCandidateProfile = centralCandidateProfileServiceObj.createCentralCandidateProfile(createCentralCandidateProfileData);
      }

      const candProfilePromises = [
        corporateCandidateProfileServiceObj.createCorporateCandidateProfile(corporateCandidateProfileCreateData),
        createOrUpdateCentralCandidateProfile,
        candidateParsedCvServiceObj.createCandidateParsedCvWithEmbedding(candidateParsedCvCreateData)
      ]

      const candidateProfileResult: (
        DbCentralCandidateProfileDto | 
        DbCorporateCandidateProfileDto | 
        DbCandidateParsedCvDto | 
        undefined
      )[] = await Promise.all(candProfilePromises);

      if(candidateProfileResult.length) {
        return true;
      } else {
        return false;
      }
    }
  }
}

const corporateCandidateProfileServiceObj = new CorporateCandidateProfileService();
export { corporateCandidateProfileServiceObj, CorporateCandidateProfileService };