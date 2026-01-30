
// Import luxon
import { DateTime } from "luxon";

// Import google cloud firestore
import { DocumentData, QueryDocumentSnapshot } from "@google-cloud/firestore";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import aws packages
import { APIGatewayProxyResult } from "aws-lambda";

// Import aws client cognito identity provider
import { AdminCreateUserCommandOutput } from "@aws-sdk/client-cognito-identity-provider";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";
import { awsClientCognitoIdentityProviderLibrary } from "../configs/aws-sdk.config";

// Import dtos
import { CandidateParsedCvAdminEmbeddingListingFilterOptions, CandidateParsedCvCorpEmbeddingListingFilterOptions, CandidateParsedCvFindMatchingScoreApiDto, CandidateParsedCvUpdateApiDto, DuplicateJobApplicantBulkCandidateParsedCvApiDTO, MoveToApplicantBulkCandidateParsedCvCreateApiDTO, MoveToApplicantCandidateParsedCvCreateApiDTO } from "../dtos/CandidateParsedCv.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import { UserDetailCreateDto } from "../dtos/UserDetail.dto";
import { UserJobApplicationMoveToApplicantCreateApiDTO } from "../dtos/UserJobApplication.dto";
import { InvokeLambdaCandidateBulkMoveToApplicantDto } from "../dtos/InvokeLambda.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse } from "../dtos/Common.dto";

// Import daos
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";

// Import enums
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";
import { UserType } from "../enums/User.enum";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";
import { InvokeLambdaHandlerEventTypeEnum } from "../enums/InvokeLambda.enum";

// Import helpers
import { getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbGcpFirestoreJobDto } from "../db/gcp-firestore-models/GcpFirestoreJob.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { DbUserJobApplicationDto } from "../db/aws-dynamodb-models/UserJobApplication.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbCandidateJobMatchingDto } from "../db/gcp-firestore-models/CandidateJobMatching.model";
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";

// Import services
import { gcpFirestoreJobServiceObj } from "./GcpFirestoreJob.service";
import UserDetailService from "./UserDetail.service";
import UlidService from "./Ulid.service";
import { userJobApplicationServiceObj } from "./UserJobApplication.service";
import { corporateUserServiceObj } from "./CorporateUser.service";
import InvokeLambdaService from "./InvokeLambda.service";
import { candidateJobMatchingServiceObj } from "./CandidateJobMatching.service";
import { centralCandidateProfileServiceObj } from "./CentralCandidateProfile.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CandidateParsedCvService {
  /**
   * Formats a list of skills into a string with the given label.
   * If the skills list is empty, an empty string is returned.
   * @param {object[]} skills - List of skills objects with skillName and years properties.
   * @param {string} label - Label to be prepended to the formatted skills string.
   * @returns {string} - Formatted string with the given label and skills list.
   */
  private formatSkillsList(skills: { skillName: string; years: number }[], label: string): string {
    if (!skills?.length) return "";
    const skillsText: string = skills.map(skill => `${skill.skillName} (${skill.years} years)`).join(", ");
    return `${label}: ${skillsText}`;
  }

  /**
   * Formats a list of strings into a string with the given label.
   * If the items list is empty, an empty string is returned.
   * @param {string[]} items - List of strings to be formatted.
   * @param {string} label - Label to be prepended to the formatted items string.
   * @returns {string} - Formatted string with the given label and items list.
   */
  private formatStringArray(items: string[], label: string): string {
    if (!items?.length) return "";
    return `${label}: ${items.join(", ")}`;
  }

  private createSearchOptimizedCandidateParsedCvEmbeddingText(createData: DbCandidateParsedCvDto): string {
    const embeddingParts: string[] = [];

    if (createData.companyId) {
      embeddingParts.push(`Company ID: ${createData.companyId}`);
    }

    if (createData.currentCompany) {
      embeddingParts.push(`Current Company: ${createData.currentCompany}`);
    }

    if (createData.currentDesignation) {
      embeddingParts.push(`Current Designation: ${createData.currentDesignation}`);
    }

    if (createData.totalYOE) {
      embeddingParts.push(`Total Experience: ${createData.totalYOE} years`);
    }

    if (createData.relevantYOE) {
      embeddingParts.push(`Relevant Experience: ${createData.relevantYOE} years`);
    }

    if (createData.currentCTC) {
      embeddingParts.push(`Current CTC: ${createData.currentCTC} LPA`);
    }

    if (createData.expectedCTC) {
      embeddingParts.push(`Expected CTC: ${createData.expectedCTC} LPA`);
    }

    if (createData.noticePeriod) {
      embeddingParts.push(`Notice Period: ${createData.noticePeriod} days`);
    }

    if (createData.isNoticePeriodNegotiable) {
      const negotiable: "Yes" | "No" = createData.isNoticePeriodNegotiable ? "Yes" : "No";
      embeddingParts.push(`Notice Period Negotiable: ${negotiable}`);
    }

    if (createData.location) {
      embeddingParts.push(`Current Location: ${createData.location}`);
    }

    if (createData.readyToRelocate) {
      const relocate: "Yes" | "No" = createData.readyToRelocate ? "Yes" : "No";
      embeddingParts.push(`Ready to Relocate: ${relocate}`);
    }

    if (createData.coreSkills) {
      const coreSkillsText: string = this.formatSkillsList(createData.coreSkills, "Core Skills");
      if (coreSkillsText) {
        embeddingParts.push(coreSkillsText);
      }
    }

    if (createData.technicalSkills) {
      const techSkillsText: string = this.formatSkillsList(createData.technicalSkills, "Technical Skills");
      if (techSkillsText) {
        embeddingParts.push(techSkillsText);
      }
    }

    if (createData.userPreferredDepartments) {
      const deptText: string = this.formatStringArray(createData.userPreferredDepartments, "Preferred Departments");
      if (deptText) {
        embeddingParts.push(deptText);
      }
    }

    if (createData.userPreferredIndustries) {
      const industryText: string = this.formatStringArray(createData.userPreferredIndustries, "Preferred Industries");
      if (industryText) {
        embeddingParts.push(industryText);
      }
    }

    if (createData.userPreferredRoles) {
      const rolesText: string = this.formatStringArray(createData.userPreferredRoles, "Preferred Roles");
      if (rolesText) {
        embeddingParts.push(rolesText);
      }
    }

    if (createData.userPreferredlocations) {
      const locationsText: string = this.formatStringArray(createData.userPreferredlocations, "Preferred Locations");
      if (locationsText) {
        embeddingParts.push(locationsText);
      }
    }

    return embeddingParts.join(" | ");
  }

  async createCandidateParsedCvWithEmbedding(
    createData: DbCandidateParsedCvDto
  ): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Create Candidate Parsed CV [Service]`, {
      methodName: this.createCandidateParsedCvWithEmbedding.name,
    });

    return candidateParsedCvDaoObj.createCandidateParsedCvWithEmbedding(
      createData,
      this.createSearchOptimizedCandidateParsedCvEmbeddingText(createData)
    );
  }

  async getAllCandidateParsedCvsByIdsWithoutPagination(
    candidateParsedCvIds: string[]
  ): Promise<DbCandidateParsedCvDto[]> {
    return candidateParsedCvDaoObj.getAllCandidateParsedCvsByIdsWithoutPagination(
      candidateParsedCvIds
    );
  }

  async getCandidateParsedCvDetailsMapByIds(
    candidateParsedCvIds: string[]
  ): Promise<Map<string, DbCandidateParsedCvDto>> {
    const retrievedCandidateParsedCvDetails: DbCandidateParsedCvDto[] =
      await this.getAllCandidateParsedCvsByIdsWithoutPagination(
        candidateParsedCvIds
      );

    return new Map(
      retrievedCandidateParsedCvDetails.map(
        (candidateParsedCv: DbCandidateParsedCvDto) => [
          candidateParsedCv.id,
          candidateParsedCv,
        ]
      )
    );
  }

  async performGetAllCandidateParsedCvByCorpEmbeddingActivities(
    filterOptions: CandidateParsedCvCorpEmbeddingListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbCandidateParsedCvDto[]>> {
    if(filterOptions.searchByJobId && filterOptions.searchByPrompt) throw new BaseError("Search by prompt and search by job description both are not allowed at the same time.", HttpStatusCode.BAD_REQUEST_400);

    const {actionByCorporateUserId} = getActionByUserId();
    if(!actionByCorporateUserId) {
      throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
    }

    const corporateUserDetails: DbCorporateUserDto = await corporateUserServiceObj.getCorpUserByIdWithParsing(actionByCorporateUserId);
    const {companyId} = corporateUserDetails;

    let searchByJobDescription: string | undefined;
    if(filterOptions.searchByJobId) {
      // Get job description by job id
      const jobDetails: DbGcpFirestoreJobDto | undefined = await gcpFirestoreJobServiceObj.getJobById(filterOptions.searchByJobId);
      if(!jobDetails) throw new BaseError("Job not found", HttpStatusCode.NOT_FOUND_404);
      if(!jobDetails.jobDescription) throw new BaseError("Job description not found", HttpStatusCode.NOT_FOUND_404);
      searchByJobDescription = jobDetails.jobDescription;
    }

    let response: GcpFirestoreRecordListingResponseDTO<QueryDocumentSnapshot<DocumentData, DocumentData>[]> = await this.getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
      filterOptions, 
      0.4,
      companyId,
      searchByJobDescription
    );
    if(response.data.length === 0) {
      global.logger.info(`Candidates for "0.4" distance threshold not found, trying "0.5"`);
      response = await this.getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
        filterOptions, 
        0.5,
        companyId,
        searchByJobDescription,
      );
      if(response.data.length === 0) {
        global.logger.info(`Candidates for "0.5" distance threshold not found, trying "0.6"`);
        response = await this.getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
          filterOptions,
          0.6,
          companyId,
          searchByJobDescription
        );
      }
    }
    const data: DbCandidateParsedCvDto[] = response.data.map((doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => doc.data() as DbCandidateParsedCvDto);
    const dataWithPagination: GcpFirestoreRecordListingResponseDTO<
      DbCandidateParsedCvDto[]
    > = {
      data,
      pagination: response.pagination
    }
    return dataWithPagination;
  }

  async performGetAllCandidateParsedCvByAdminEmbeddingActivities(filterOptions: CandidateParsedCvAdminEmbeddingListingFilterOptions) {
    if(filterOptions.searchByJobId && filterOptions.searchByPrompt) throw new BaseError("Search by prompt and search by job description both are not allowed at the same time.", HttpStatusCode.BAD_REQUEST_400);

    let searchByJobDescription: string | undefined;
    if(filterOptions.searchByJobId) {
      // Get job description by job id
      const jobDetails: DbGcpFirestoreJobDto | undefined = await gcpFirestoreJobServiceObj.getJobById(filterOptions.searchByJobId);
      if(!jobDetails) throw new BaseError("Job not found", HttpStatusCode.NOT_FOUND_404);
      if(!jobDetails.jobDescription) throw new BaseError("Job description not found", HttpStatusCode.NOT_FOUND_404);
      searchByJobDescription = jobDetails.jobDescription;
    }

    let response: GcpFirestoreRecordListingResponseDTO<QueryDocumentSnapshot<DocumentData, DocumentData>[]> = await this.getAllCandidateParsedCvByAdminEmbeddingFilterOptions(
      filterOptions, 
      0.4,
      searchByJobDescription
    );
    if(response.data.length === 0) {
      global.logger.info(`Candidates for "0.4" distance threshold not found, trying "0.5"`);
      response = await this.getAllCandidateParsedCvByAdminEmbeddingFilterOptions(
        filterOptions, 
        0.5,
        searchByJobDescription,
      );
      if(response.data.length === 0) {
        global.logger.info(`Candidates for "0.5" distance threshold not found, trying "0.6"`);
        response = await this.getAllCandidateParsedCvByAdminEmbeddingFilterOptions(
          filterOptions,
          0.6,
          searchByJobDescription
        );
      }
    }
    const data: DbCandidateParsedCvDto[] = response.data.map((doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => doc.data() as DbCandidateParsedCvDto);
    const dataWithPagination: GcpFirestoreRecordListingResponseDTO<
      DbCandidateParsedCvDto[]
    > = {
      data,
      pagination: response.pagination
    }
    return dataWithPagination;
  }

  async getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
    filterOptions: CandidateParsedCvCorpEmbeddingListingFilterOptions,
    distanceThreshold: number,
    companyId: string,
    searchByJobDescription?: string
  ): Promise<
    GcpFirestoreRecordListingResponseDTO<QueryDocumentSnapshot<DocumentData, DocumentData>[]>
  > {
    return candidateParsedCvDaoObj.getAllCandidateParsedCvByCorpEmbeddingFilterOptions(
      filterOptions,
      distanceThreshold,
      companyId,
      searchByJobDescription
    );
  }

  async getAllCandidateParsedCvByAdminEmbeddingFilterOptions(
    filterOptions: CandidateParsedCvAdminEmbeddingListingFilterOptions,
    distanceThreshold: number,
    searchByJobDescription?: string
  ): Promise<
    GcpFirestoreRecordListingResponseDTO<QueryDocumentSnapshot<DocumentData, DocumentData>[]>
  > {
    return candidateParsedCvDaoObj.getAllCandidateParsedCvByAdminEmbeddingFilterOptions(
      filterOptions,
      distanceThreshold,
      searchByJobDescription
    );
  }

  async getCandidateParsedCvById(id: string): Promise<DbCandidateParsedCvDto | undefined> {
    return candidateParsedCvDaoObj.getCandidateParsedCvById(id);
  }

  private async createJobApplicationMoveToApplicant(
    validatedRequestBody: MoveToApplicantCandidateParsedCvCreateApiDTO,
    cognitoUserGroups: string[],
    candidateParsedCvDetails: DbCandidateParsedCvDto,
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ): Promise<DbUserJobApplicationDto> {
    const {jobTitle, ...restValidatedRequestBody} = validatedRequestBody;
    const candJobMatchingDetails: DbCandidateJobMatchingDto | undefined = await candidateJobMatchingServiceObj.getCandidateJobMatchingByEmailAndJobId(
      candidateParsedCvDetails.email,
      validatedRequestBody.jobId
    );

    // Prepare job application create data
    const jobApplicationCreateData: UserJobApplicationMoveToApplicantCreateApiDTO = {
      ...restValidatedRequestBody,
      applicantEmail: candidateParsedCvDetails.email,

      agencyUserId: candidateParsedCvDetails.agencyUserId,
      agencyUserSubmissionId: candidateParsedCvDetails.agencyUserSubmissionId,
    };

    if(candJobMatchingDetails) {
      const {
        cvExtract,
        jdMatchErrorCode,
        jdMatchErrorDesc,
        matchingScore,
        checkEXPdata,
        rejectCTCAndEXP,
        rejectionFeedbackBySystem,
        rejectionFeedbackBySystemForApplicant,
        scoreDetails,
        scoreDetailsForApplicant,
        scoreFetchedDate,
        emailFeedback,
      } = candJobMatchingDetails;
      jobApplicationCreateData.matchingScoreDetails = {
        cvExtract,
        jdMatchErrorCode,
        jdMatchErrorDesc,
        matchingScore,
        checkEXPdata,
        rejectCTCAndEXP,
        rejectionFeedbackBySystem,
        rejectionFeedbackBySystemForApplicant,
        scoreDetails,
        scoreDetailsForApplicant,
        scoreFetchedDate,
        emailFeedback
      };
    }

    const moveToApplicantDetails: DbUserJobApplicationDto =
      await userJobApplicationServiceObj.createJobApplicationMoveToApplicant(
      jobApplicationCreateData,
      cognitoUserGroups,
      actionByUserId,
      actionByCorporateUserId
    );
    if(moveToApplicantDetails.status !== JobApplicationStatus.ACCEPTED) {
      global.logger.error(`Failed to move to applicant`, { methodName: this.moveToApplicantCandidateParsedCv.name, moveToApplicantDetails });
      throw new BaseError("Failed to move to applicant", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return moveToApplicantDetails;
  }

  private async moveToApplUpdateCtcDetailsCandidateParsedCv(
    validatedRequestBody: MoveToApplicantCandidateParsedCvCreateApiDTO,
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    if(
      validatedRequestBody.expectedCTC 
      || validatedRequestBody.noticePeriod
      || validatedRequestBody.currentCTC
    ) {
      const updateData: Partial<DbCandidateParsedCvDto> = {
        updatedAt: dateHelperObj.getISODate(),
        updatedByCorporateUserId: actionByCorporateUserId,
        updatedByUserId: actionByUserId
      }
      if(validatedRequestBody.currentCTC) updateData.currentCTC = validatedRequestBody.currentCTC;
      if(validatedRequestBody.expectedCTC) updateData.expectedCTC = validatedRequestBody.expectedCTC;
      if(validatedRequestBody.noticePeriod) updateData.relevantYOE = validatedRequestBody.noticePeriod;
      const updateCandParsedDetails = await candidateParsedCvServiceObj.updateCandidateParsedCvWithEmbedding(
        validatedRequestBody.candidateParsedCvId, 
        updateData
      );
      if(!updateCandParsedDetails) {
        global.logger.error(`Failed to update candidate parsed cv`, { methodName: this.moveToApplicantCandidateParsedCv.name, validatedRequestBody, updateCandParsedDetails });
        throw new BaseError("Failed to update candidate parsed cv", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }
    }
  }

  async moveToApplicantCandidateParsedCv(
    validatedRequestBody: MoveToApplicantCandidateParsedCvCreateApiDTO,
    cognitoUserGroups: string[],
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    if(!actionByCorporateUserId) {
      if(!actionByUserId || !cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)) {
        global.logger.error(`Only corporate or worko admin can move to applicant.`, { 
          methodName: this.moveToApplicantCandidateParsedCv.name, 
          validatedRequestBody,
          actionByUserId,
          cognitoUserGroups,
        });
        throw new BaseError("You are not allowed to access this resource.", HttpStatusCode.FORBIDDEN_403);
      }
    }

    if(actionByCorporateUserId) {
      const corporateUserDetails: QueryResponse<DbCorporateUserDto> = await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
      if(!corporateUserDetails.count) {
        global.logger.error(`Failed to move to applicant, Corporate User not found`, { methodName: this.moveToApplicantCandidateParsedCv.name, validatedRequestBody });
        throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }

      const reqBodyJobDetails: DbGcpFirestoreJobDto | undefined = await gcpFirestoreJobServiceObj.getJobById(validatedRequestBody.jobId);
      if(!reqBodyJobDetails) {
        global.logger.error(`Failed to move to applicant, Job not found`, { methodName: this.moveToApplicantCandidateParsedCv.name, validatedRequestBody });
        throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }

      const corporateUserData: DbCorporateUserDto = corporateUserDetails[0];
      if(corporateUserData.companyId !== reqBodyJobDetails.companyId) {
        global.logger.error(`Failed to move to applicant, Corporate User Company Id and Job Company Id does not match`, { methodName: this.moveToApplicantCandidateParsedCv.name, validatedRequestBody });
        throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }
    }

    const candidateParsedCvDetails: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(
      validatedRequestBody.candidateParsedCvId
    );
    if(!candidateParsedCvDetails) {
      global.logger.error(`Failed to move to applicant, Candidate Parsed Cv not found`, { methodName: this.moveToApplicantCandidateParsedCv.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const {
      name: candidateName,
      phoneNumberDetails: candidatePhoneNumberDetails,
      email: candidateEmail
    } = candidateParsedCvDetails;

    const workoUserPoolId: string | undefined = process.env.APP_AWS_WORKO_COGNITO_USER_POOL_ID;
    if(!workoUserPoolId) {
      global.logger.error(`Failed to move to applicant, Worko User Pool Id not found`, { methodName: this.moveToApplicantCandidateParsedCv.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const applicantRegisteredDetails: QueryResponse<DbUserDetailDto> = await UserDetailService.get(
      candidateEmail
    );
    if(applicantRegisteredDetails.count) {
      const awaitedResponse: [DbUserJobApplicationDto, void] = await Promise.all([
        this.createJobApplicationMoveToApplicant(validatedRequestBody, cognitoUserGroups, candidateParsedCvDetails, actionByUserId, actionByCorporateUserId),
        this.moveToApplUpdateCtcDetailsCandidateParsedCv(validatedRequestBody, actionByUserId, actionByCorporateUserId)
      ]) 

      return awaitedResponse[0];
    }

    const {
      number: candidatePhoneNumber,
      countryCode: candidatePhoneNumberCountryCode
    } = candidatePhoneNumberDetails;
    const candidateFullPhoneNumber: string = `+${candidatePhoneNumberCountryCode}${candidatePhoneNumber}`;
    const temporaryPassword: string = `Temp${UlidService.getUlidId().toLowerCase()}!`; // temporary password with lowercase

    const userCreateCognito: AdminCreateUserCommandOutput = await awsClientCognitoIdentityProviderLibrary.createUser(
      workoUserPoolId,
      candidateEmail,
      temporaryPassword,
      [
        { Name: "name", Value: candidateName },
        { Name: "phone_number", Value: `+${candidatePhoneNumberCountryCode}${candidatePhoneNumber}` }
      ],
      "SUPPRESS"
    );
    if(!userCreateCognito.User?.Username) {
      global.logger.error(`Failed to move to applicant, Failed to create user in cognito`, { methodName: this.moveToApplicantCandidateParsedCv.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    };

    const createUserDetailDto: UserDetailCreateDto = {
      id: userCreateCognito.User.Username,
      userId: userCreateCognito.User.Username,
      name: candidateName,
      email: candidateEmail,
      number: candidateFullPhoneNumber,
      ECTC: candidateParsedCvDetails.expectedCTC,
      YOE: candidateParsedCvDetails.relevantYOE,
      emailList: {
        primary: candidateEmail
      },
      userType: [UserType.CAND],
      isEmailVerified: false,
      isNumberVerified: false,
      lastAccessedDash: UserType.CAND,
      referralCount: 0,
      isSubscribed: false,

      /**
       * @note It is dummy value, it is being updated later in the process
       * @todo Need to check when and where this is updating in the process
       */
      expiryDate: DateTime.now().toJSDate(), 

      acceptedTermsAndConditions: false,
      isUserCreatedInternally: true
    };

    const userDetailAndJobAppl: [DbUserDetailDto, DbUserJobApplicationDto,boolean, boolean, void] = await Promise.all([
      UserDetailService.createUserDetail(createUserDetailDto),
      this.createJobApplicationMoveToApplicant(validatedRequestBody, cognitoUserGroups, candidateParsedCvDetails, actionByUserId, actionByCorporateUserId),
      UserDetailService.sendEmailForCandAcctSignupReminder(
        candidateEmail,
        validatedRequestBody.jobTitle,
        validatedRequestBody.companyName,
        candidateName,
        temporaryPassword
      ),
      UserDetailService.scheduleCandChangePassSignupReminder(
        {
          candidateEmail,
          candidateName,
          jobTitle: validatedRequestBody.jobTitle,
          companyName: validatedRequestBody.companyName,
          temporaryPassword,
          candidateCognitoUserId: userCreateCognito.User.Username,
          reminderSendCount: 0
        }
      ),
      this.moveToApplUpdateCtcDetailsCandidateParsedCv(validatedRequestBody, actionByUserId, actionByCorporateUserId)
    ]);

    if(!userDetailAndJobAppl[0] || !userDetailAndJobAppl[1] || !userDetailAndJobAppl[2] || !userDetailAndJobAppl[3]) {
      global.logger.error(`Failed to move to applicant, Failed to create user detail`, { methodName: this.moveToApplicantCandidateParsedCv.name, userDetailAndJobAppl });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return userDetailAndJobAppl[1];
  }

  async duplicateJobApplicantBulkCandidateParsedCv(
    validatedRequestBody: DuplicateJobApplicantBulkCandidateParsedCvApiDTO
  ): Promise<PaginatedResultsWithMatchingConditionsInternalResponse<DbUserJobApplicationDto[]>> {
    return userJobApplicationServiceObj.getJobApplicationByJobIdAndApplicantEmails(
      validatedRequestBody.jobId,
      validatedRequestBody.applicantEmails,
      {
        pageSize: validatedRequestBody.applicantEmails.length
      }
    );
  } 

  async moveToApplicantBulkCandidateParsedCvAsync(
    validatedRequestBody: MoveToApplicantBulkCandidateParsedCvCreateApiDTO,
    cognitoUserGroups: string[],
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ): Promise<APIGatewayProxyResult[]>
  {
    if (!actionByCorporateUserId) {
      if (
        !actionByUserId ||
        !cognitoUserGroups.includes(
          APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN,
        )
      ) {
        global.logger.error(
          `Only corporate or worko admin can move to applicant bulk.`,
          {
            methodName: this.moveToApplicantBulkCandidateParsedCvAsync.name,
            validatedRequestBody,
            actionByUserId,
            cognitoUserGroups,
          },
        );
        throw new BaseError(
          "You are not allowed to access this resource.",
          HttpStatusCode.FORBIDDEN_403,
        );
      }
    }

    if (actionByCorporateUserId) {
      const corporateUserDetails: QueryResponse<DbCorporateUserDto> =
        await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
      if (!corporateUserDetails.count) {
        global.logger.error(
          `Failed to bulk move to applicant, Corporate User not found`,
          {
            methodName: this.moveToApplicantBulkCandidateParsedCvAsync.name,
            validatedRequestBody,
          },
        );
        throw new BaseError(
          "Failed to bulk move to applicant.",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500,
        );
      }

      const reqBodyJobDetails: DbGcpFirestoreJobDto | undefined =
        await gcpFirestoreJobServiceObj.getJobById(validatedRequestBody.jobId);
      if (!reqBodyJobDetails) {
        global.logger.error(`Failed to bulk move to applicant, Job not found`, {
          methodName: this.moveToApplicantBulkCandidateParsedCvAsync.name,
          validatedRequestBody,
        });
        throw new BaseError(
          "Failed to bulk move to applicant.",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500,
        );
      }

      const corporateUserData: DbCorporateUserDto = corporateUserDetails[0];
      if (corporateUserData.companyId !== reqBodyJobDetails.companyId) {
        global.logger.error(
          `Failed to bulk move to applicant, Corporate User Company Id and Job Company Id does not match`,
          {
            methodName: this.moveToApplicantCandidateParsedCv.name,
            validatedRequestBody,
          },
        );
        throw new BaseError(
          "Failed to bulk move to applicant.",
          HttpStatusCode.INTERNAL_SERVER_ERROR_500,
        );
      }
    }

    const invokeLambdaPromises = validatedRequestBody.candidateParsedCvs.map(async (eachCandidateParsedCv: { candidateParsedCvId: string, currentCTC?: number, expectedCTC?: number, noticePeriod?: number })  => {
      const invokeDataPayload: InvokeLambdaCandidateBulkMoveToApplicantDto = {
        jobId: validatedRequestBody.jobId,
        candidateParsedCvId: eachCandidateParsedCv.candidateParsedCvId,
        currentCTC: eachCandidateParsedCv.currentCTC,
        expectedCTC: eachCandidateParsedCv.expectedCTC,
        noticePeriod: eachCandidateParsedCv.noticePeriod,
        companyName: validatedRequestBody.companyName,
        jobTitle: validatedRequestBody.jobTitle,
        cognitoUserGroups,
        actionByUserId,
        actionByCorporateUserId
      }
      return InvokeLambdaService.triggerWorkoCorpAppInvokeLambdaTrigger({
        eventType: InvokeLambdaHandlerEventTypeEnum.CANDIDATE_BULK_MOVE_TO_APPLICANT,
        data: invokeDataPayload
      });
    })

    return Promise.all(invokeLambdaPromises);
  }

  async findMatchingScoreCandidateParsedCv(validatedReqBody: CandidateParsedCvFindMatchingScoreApiDto): Promise<{
    candidateJobMatchingId?: string
  } | DbCandidateJobMatchingDto | DbUserJobApplicationDto> {
    const {
      actionByUserId,
      actionByCorporateUserId,
    } = getActionByUserId();

    const {
      candidateParsedCvId,
      jobId
    } = validatedReqBody;

    const existingCandidateParsedCv: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(candidateParsedCvId);
    if(!existingCandidateParsedCv) {
      global.logger.error(`Candidate parsed cv not found.`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        validatedReqBody,
        existingCandidateParsedCv
      });
      throw new BaseError("Failed to find matching score.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const jobDetails: DbGcpFirestoreJobDto | undefined = await gcpFirestoreJobServiceObj.getJobById(jobId);
    if(!jobDetails) {
      global.logger.error(`Job not found.`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        validatedReqBody,
        jobDetails
      });
      throw new BaseError("Failed to find matching score.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    if(actionByCorporateUserId) {
      const corporateUserDetails: QueryResponse<DbCorporateUserDto> = await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
      if(!corporateUserDetails.count) {
        global.logger.error(`Corporate user not found.`, {
          methodName: this.findMatchingScoreCandidateParsedCv.name,
          validatedReqBody,
          corporateUserDetails
        });
        throw new BaseError("Failed to find matching score.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }

      const corporateUserData: DbCorporateUserDto = corporateUserDetails[0];

      if(corporateUserData.companyId !== jobDetails.companyId) {
        global.logger.error(`Unauthorized access because corporate user company and job details company do not match.`, {
          methodName: this.findMatchingScoreCandidateParsedCv.name,
          validatedReqBody,
          corporateUserData,
          jobDetails
        });
        throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
      }
    }

    const {
      cvAwsS3BucketName,
      cvAwsS3FilePath,
      cvAwsS3FileName,
      email: candidateEmail,
    } = existingCandidateParsedCv;

    const existingFindMatchingScore: DbCandidateJobMatchingDto | undefined = await candidateJobMatchingServiceObj.getCandidateJobMatchingByEmailAndJobId(
      candidateEmail,
      jobId
    );
    if(existingFindMatchingScore) {
      global.logger.info(`Matching score already calculated`, { 
        methodName: this.findMatchingScoreCandidateParsedCv.name, 
        validatedReqBody,
      });
      return existingFindMatchingScore;
    }

    // Check if the user has already applied for the job and throw error if already applied for the job
    let existingUserJobApplicationQueryResponse: QueryResponse<DbUserJobApplicationDto> =
      await userJobApplicationServiceObj.getJobApplicationByjobId(
        candidateEmail,
        jobId
      );
    if(existingUserJobApplicationQueryResponse.count) {
      global.logger.error(`Failed to find matching score, Candidate already in applicants page`, { 
        methodName: this.findMatchingScoreCandidateParsedCv.name, 
        validatedReqBody,
      });
      const jobApplicationData: DbUserJobApplicationDto = existingUserJobApplicationQueryResponse[0];
      if(jobApplicationData.matchingScore) {
        return jobApplicationData;
      } else {
        /**
         * @todo: 
         *  1. Need to check with "Product Manager" about how to handle this case
         */
        throw new BaseError("Candidate already moved to application process without calculating matching score.", HttpStatusCode.CONFLICT_409);
      }
    }

    /**
     * @todo:
     *  1. Need to implement a feature like after `3` months the `corporate` should able to find the matching score again
     */
    const createCandJobMatchDetails: DbCandidateJobMatchingDto | undefined = await candidateJobMatchingServiceObj.createCandidateJobMatching(
      candidateEmail,
      jobId,
      jobDetails.companyId as string,
      {
        createdByCorporateUserId: actionByCorporateUserId,
        createdByUserId: actionByUserId
      }
    );
    if(!createCandJobMatchDetails) {
      global.logger.error(`Failed to find matching score, Failed to create candidate job matching`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        validatedReqBody,
      });
      throw new BaseError("Failed to find matching score.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const invokedMatchingScoreDetails: APIGatewayProxyResult = await InvokeLambdaService.triggerSourceTypeJdResumeMatchingScore(
      {
        candidateJobMatchingId: createCandJobMatchDetails.id,
        cvAwsS3ResourceType: existingCandidateParsedCv.cvAwsS3ResourceType,
        actionByCorporateUserId,
        actionByUserId,
        jobId, 
        cvAwsS3BucketName,
        cvAwsS3FilePath,
        cvAwsS3FileName,
        USER_PK: existingCandidateParsedCv.cvAwsS3ResourceType === CandidateParsedCvAwsS3ResourceTypeEnum.USER_RESUME ? `USR#EML#${existingCandidateParsedCv.email}`: undefined
      }
    );
    if(invokedMatchingScoreDetails.statusCode !== HttpStatusCode.ACCEPTED_202) {
      global.logger.error(`Failed to find matching score`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        invokedMatchingScoreDetails,
      });
      throw new BaseError("Failed to find matching score", invokedMatchingScoreDetails.statusCode);
    }

    if(invokedMatchingScoreDetails.statusCode === HttpStatusCode.ACCEPTED_202) {
      global.logger.info(`Matching score processing started`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        invokedMatchingScoreDetails,
      });

      return {
        candidateJobMatchingId: createCandJobMatchDetails.id
      };
    } else {
      return {
        candidateJobMatchingId: undefined
      };
    }
  }

  async updateCandidateParsedCvById(id: string, updateDto: Partial<DbCandidateParsedCvDto>): Promise<DbCandidateParsedCvDto | undefined> {
    return candidateParsedCvDaoObj.updateCandidateParsedCvById(id, updateDto);
  }

  async updateCandidateParsedCvWithEmbedding(
    id: string,
    updateData: Partial<DbCandidateParsedCvDto>
  ): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Update Candidate Parsed CV with Embedding [Service]`, {
      methodName: this.updateCandidateParsedCvWithEmbedding.name,
    });

    const existingData: DbCandidateParsedCvDto | undefined = await candidateParsedCvDaoObj.getCandidateParsedCvById(id);
    if (!existingData) {
      throw new BaseError(
        "Candidate Parsed CV does not exist",
        HttpStatusCode.NOT_FOUND_404
      )
    };

    const mergedData: DbCandidateParsedCvDto = { ...existingData, ...updateData };
    const embeddingText: string = this.createSearchOptimizedCandidateParsedCvEmbeddingText(mergedData);

    return candidateParsedCvDaoObj.updateCandidateParsedCvWithEmbedding(id, updateData, embeddingText);
  }

  async performUpdateCandidateParsedCv(
    id: string,
    updateDto: CandidateParsedCvUpdateApiDto
  ): Promise<DbCandidateParsedCvDto> {
    const {actionByUserId, actionByCorporateUserId} = getActionByUserId();
    
    const updatedAt: string = dateHelperObj.getISODate();
    const updatedCandidateParsedCv: DbCandidateParsedCvDto | undefined = await this.updateCandidateParsedCvWithEmbedding(
      id,
      {
        ...updateDto,
        updatedByUserId:actionByUserId,
        updatedByCorporateUserId:actionByCorporateUserId,
        updatedAt,
      }
    );
    if (!updatedCandidateParsedCv) {
      global.logger.error(`Failed to update candidate parsed cv.`, {
        methodName: this.performUpdateCandidateParsedCv.name,
        id,
        updateDto,
      });
      throw new BaseError("Failed to update candidate parsed cv.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    if(actionByCorporateUserId) {
      const existingCentralCandProfile: DbCentralCandidateProfileDto | undefined = await centralCandidateProfileServiceObj.getCentralCandidateProfileById(
        updatedCandidateParsedCv.email
      );
      if(!existingCentralCandProfile) {
        global.logger.error(`Failed to update candidate parsed cv, Central Candidate Profile not found`, {
          methodName: this.performUpdateCandidateParsedCv.name,
          id,
          updateDto,
        });
        throw new BaseError("Internal Server Error.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }

      if(existingCentralCandProfile.latestCandidateParsedCvId !== updatedCandidateParsedCv.id) {
        const updateCentralProfileData: Partial<DbCentralCandidateProfileDto> = {
          updatedAt: updatedAt,
          latestCandidateParsedCvId: updatedCandidateParsedCv.id
        }

        // add candidate parsed cv id if not present
        if(!existingCentralCandProfile.candidateParsedCvIds.includes(updatedCandidateParsedCv.id)) {
          updateCentralProfileData.candidateParsedCvIds = [...existingCentralCandProfile.candidateParsedCvIds, updatedCandidateParsedCv.id];
        }
        const updatedCentralCandProfile: DbCentralCandidateProfileDto | undefined = await centralCandidateProfileServiceObj.updateCentralCandidateProfileById(
          existingCentralCandProfile.id,
          updateCentralProfileData
        );
        if(!updatedCentralCandProfile) {
          global.logger.error(`Failed to update candidate parsed cv, Central Candidate Profile not found`, {
            methodName: this.performUpdateCandidateParsedCv.name,
            id,
            updateDto,
          });
          throw new BaseError("Internal Server Error.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
        }
      }
    }

    return updatedCandidateParsedCv;
  }
}

const candidateParsedCvServiceObj = new CandidateParsedCvService();
export { candidateParsedCvServiceObj, CandidateParsedCvService };