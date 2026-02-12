
// Import luxon
import { DateTime } from "luxon";

// Import google cloud firestore
import { DocumentData, QueryDocumentSnapshot, QuerySnapshot } from "@google-cloud/firestore";

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
import { CandidateParsedCvAdminEmbeddingListingFilterOptions, CandidateParsedCvBulkFindMatchingScoreApiDto, CandidateParsedCvCorpEmbeddingListingFilterOptions, CandidateParsedCvFindMatchingScoreApiDto, CandidateParsedCvParseSubmitFormApiDto, CandidateParsedCvParseSubmitFormResponseDto, CandidateParsedCvSubmitFormCreateApiDto, CandidateParsedCvUpdateApiDto, DuplicateJobApplicantBulkCandidateParsedCvApiDTO, MoveToApplicantBulkCandidateParsedCvCreateApiDTO, MoveToApplicantCandidateParsedCvCreateApiDTO, MoveToApplicantSubmitFormCandidateParsedCvCreateApiDTO } from "../dtos/CandidateParsedCv.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import { UserDetailCreateDto } from "../dtos/UserDetail.dto";
import { UserJobApplicationMoveToApplicantCreateApiDTO, UserJobApplicationMoveToApplicantSubmitFormCreateApiDTO } from "../dtos/UserJobApplication.dto";
import { InvokeLambdaCandidateBulkMoveToApplicantDto, InvokeLambdaSubmitFormCandidateParsedCvActivityDto } from "../dtos/InvokeLambda.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse } from "../dtos/Common.dto";
import { EmailTemplatePlaceholderCAND_DUPLICATE_JOB_APPLICATION_SUBMIT_FORM_FOR_JOB, EmailTemplatePlaceholderCAND_SUCCESS_SUBMIT_FORM_FOR_JOB } from "../dtos/EmailTemplatePlaceholder.dto";

// Import daos
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";

// Import enums
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";
import { UserType } from "../enums/User.enum";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";
import { InvokeLambdaHandlerEventTypeEnum } from "../enums/InvokeLambda.enum";
import { CorporateCandidateProfileDbRefereeTypeEnum } from "../enums/CorporateCandidateProfile.enum";
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";

// Import helpers
import { getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import libraries
import { emailLibrary, EmailSourceDestinationAddress } from "../libraries/email.library";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbGcpFirestoreJobDto } from "../db/gcp-firestore-models/GcpFirestoreJob.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { DbUserJobApplicationDto } from "../db/aws-dynamodb-models/UserJobApplication.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbCandidateJobMatchingDto } from "../db/gcp-firestore-models/CandidateJobMatching.model";
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";

// Import services
import { gcpFirestoreJobServiceObj } from "./GcpFirestoreJob.service";
import UserDetailService from "./UserDetail.service";
import UlidService from "./Ulid.service";
import { userJobApplicationServiceObj } from "./UserJobApplication.service";
import { corporateUserServiceObj } from "./CorporateUser.service";
import InvokeLambdaService from "./InvokeLambda.service";
import { candidateJobMatchingServiceObj } from "./CandidateJobMatching.service";
import { centralCandidateProfileServiceObj } from "./CentralCandidateProfile.service";
import { companyDetailServiceObj } from "./CompanyDetail.service";
import { corporateCandidateProfileServiceObj } from "./CorporateCandidateProfile.service";

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

  private async createJobApplicationMoveToApplicantSubmitForm(
    validatedRequestBody: MoveToApplicantSubmitFormCandidateParsedCvCreateApiDTO,
    candidateParsedCvDetails: DbCandidateParsedCvDto,
  ): Promise<boolean> {
    const {jobTitle, ...restValidatedRequestBody} = validatedRequestBody;

    // Prepare job application create data
    const jobApplicationCreateData: UserJobApplicationMoveToApplicantSubmitFormCreateApiDTO = {
      ...restValidatedRequestBody,
      applicantEmail: candidateParsedCvDetails.email,
    };

    const moveToApplicantDetails: boolean = await userJobApplicationServiceObj.createJobApplicationMoveToApplicantSubmitForm(
      jobApplicationCreateData,
    );

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

  async moveToApplicantSubmitFormCandidateParsedCv(
    validatedRequestBody: MoveToApplicantSubmitFormCandidateParsedCvCreateApiDTO
  ) {
    const reqBodyJobDetails: DbGcpFirestoreJobDto | undefined = await gcpFirestoreJobServiceObj.getJobById(validatedRequestBody.jobId);
    if(!reqBodyJobDetails) {
      global.logger.error(`Failed to move to applicant, Job not found`, { methodName: this.moveToApplicantSubmitFormCandidateParsedCv.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const candidateParsedCvDetails: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(
      validatedRequestBody.candidateParsedCvId
    );
    if(!candidateParsedCvDetails) {
      global.logger.error(`Failed to move to applicant, Candidate Parsed Cv not found`, { methodName: this.moveToApplicantSubmitFormCandidateParsedCv.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const {
      name: candidateName,
      phoneNumberDetails: candidatePhoneNumberDetails,
      email: candidateEmail
    } = candidateParsedCvDetails;

    const workoUserPoolId: string | undefined = process.env.APP_AWS_WORKO_COGNITO_USER_POOL_ID;
    if(!workoUserPoolId) {
      global.logger.error(`Failed to move to applicant, Worko User Pool Id not found`, { methodName: this.moveToApplicantSubmitFormCandidateParsedCv.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const applicantRegisteredDetails: QueryResponse<DbUserDetailDto> = await UserDetailService.get(
      candidateEmail
    );
    if(applicantRegisteredDetails.count) {
      return this.createJobApplicationMoveToApplicantSubmitForm(validatedRequestBody, candidateParsedCvDetails);
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
      global.logger.error(`Failed to move to applicant, Failed to create user in cognito`, { methodName: this.moveToApplicantSubmitFormCandidateParsedCv.name, validatedRequestBody });
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

    const userDetailAndJobAppl: [DbUserDetailDto, boolean,boolean, boolean] = await Promise.all([
      UserDetailService.createUserDetail(createUserDetailDto),
      this.createJobApplicationMoveToApplicantSubmitForm(validatedRequestBody, candidateParsedCvDetails),
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
    ]);

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

  async findMatchingScoreBulkCandidateParsedCv(
    companyId: string,
    jobId: string,
    candidateParsedCvId: string,
    actionByCorporateUserId?: string,
    actionByUserId?: string
  ): Promise<{
    initiatedCandidateJobMatchingId: string
  } | { failedCandidateJobMatchingScores: { candidateParsedCvId: string, error?: string } } | { existingMatchingScore: DbCandidateJobMatchingDto | DbUserJobApplicationDto }> {
    const existingCandidateParsedCv: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(candidateParsedCvId);
    if(!existingCandidateParsedCv) {
      global.logger.error(`Candidate parsed cv not found.`, {
        methodName: this.findMatchingScoreBulkCandidateParsedCv.name,
        jobId,
        existingCandidateParsedCv
      });
      return {
        failedCandidateJobMatchingScores: { candidateParsedCvId, error: "Candidate parsed cv not found." }
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
        methodName: this.findMatchingScoreBulkCandidateParsedCv.name, 
        jobId,
        candidateParsedCvId
      });
      if(existingFindMatchingScore.matchingScore) {
        return {
          existingMatchingScore: existingFindMatchingScore
        };
      } else {
        return {
          initiatedCandidateJobMatchingId: existingFindMatchingScore.id
        };
      }
    }

    // Check if the user has already applied for the job and throw error if already applied for the job
    let existingUserJobApplicationQueryResponse: QueryResponse<DbUserJobApplicationDto> =
      await userJobApplicationServiceObj.getJobApplicationByjobId(
        candidateEmail,
        jobId
      );
    if(existingUserJobApplicationQueryResponse.count) {
      global.logger.error(`Failed to find matching score, Candidate already in applicants page`, { 
        methodName: this.findMatchingScoreBulkCandidateParsedCv.name, 
        jobId,
      });
      const jobApplicationData: DbUserJobApplicationDto = existingUserJobApplicationQueryResponse[0];
      if(jobApplicationData.matchingScore) {
        return {
          existingMatchingScore: jobApplicationData
        };
      } else {
        global.logger.error("Candidate already moved to application process without calculating matching score.", {
          methodName: this.findMatchingScoreBulkCandidateParsedCv.name,
          jobId,
          jobApplicationData,
          candidateParsedCvId
        });
        return {
          failedCandidateJobMatchingScores: { candidateParsedCvId, error: "Candidate already moved to application process without calculating matching score." }
        }
      }
    }

    /**
     * @todo:
     *  1. Need to implement a feature like after `3` months the `corporate` should able to find the matching score again
     */
    const createCandJobMatchDetails: DbCandidateJobMatchingDto | undefined = await candidateJobMatchingServiceObj.createCandidateJobMatching(
      candidateEmail,
      jobId,
      companyId,
      {
        createdByCorporateUserId: actionByCorporateUserId,
        createdByUserId: actionByUserId
      }
    );
    if(!createCandJobMatchDetails) {
      global.logger.error(`Failed to find matching score, Failed to create candidate job matching`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        jobId,
      });
      return {
        failedCandidateJobMatchingScores: { candidateParsedCvId, error: "Failed to create candidate job matching" }
      }
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
      global.logger.error(`Ai matching score lambda trigger failed`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        invokedMatchingScoreDetails,
      });
      return {
        failedCandidateJobMatchingScores: { candidateParsedCvId, error: "Ai matching score lambda trigger failed" }
      }
    }

    if(invokedMatchingScoreDetails.statusCode === HttpStatusCode.ACCEPTED_202) {
      global.logger.info(`Matching score processing started`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        invokedMatchingScoreDetails,
      });

      return {
        initiatedCandidateJobMatchingId: createCandJobMatchDetails.id
      };
    } else {
      return {
        failedCandidateJobMatchingScores: { candidateParsedCvId, error: "Ai matching score lambda trigger failed" }
      };
    }
  }

  async performFindMatchingScoreBulkCandidateParsedCv(
    reqBody: CandidateParsedCvBulkFindMatchingScoreApiDto
  ): Promise<{
    existingCandidateJobMatchingScores: Array<
      { candidateParsedCvId: string } &
      (Partial<DbCandidateJobMatchingDto> | Partial<DbUserJobApplicationDto>)
    >;
    initiatedCandidateJobMatchingScores: { candidateParsedCvId: string, candidateJobMatchingId: string }[];
    failedCandidateJobMatchingScores: { candidateParsedCvId: string, error?: string }[];
  }> {
    const { actionByUserId, actionByCorporateUserId } = getActionByUserId();
    const { candidateParsedCvIds, jobId } = reqBody;

    const jobDetails: DbGcpFirestoreJobDto | undefined = await gcpFirestoreJobServiceObj.getJobById(jobId);
    if(!jobDetails) throw new BaseError("Job not found.", HttpStatusCode.NOT_FOUND_404);

    if(actionByCorporateUserId) {
      const corporateUserDetails: QueryResponse<DbCorporateUserDto> = await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
      if(!corporateUserDetails.count || corporateUserDetails[0].companyId !== jobDetails.companyId) {
        global.logger.error("Corporate user not authorized.", {
          methodName: this.performFindMatchingScoreBulkCandidateParsedCv.name,
          actionByCorporateUserId,
          jobId,
          corporateUserDetails
        });
        throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
      }
    }

    const existingMatchingScores: Array<
      { candidateParsedCvId: string } &
      (Partial<DbCandidateJobMatchingDto> | Partial<DbUserJobApplicationDto>)
    > = [];
    const initiatedCandidateJobMatchingIds: { candidateParsedCvId: string, candidateJobMatchingId: string }[] = [];
    const failedCandidateParsedCvs: { candidateParsedCvId: string, error?: string }[] = [];

    const bulkPromises = candidateParsedCvIds.map(async (candidateId: string) => {
      try {
        const result: {
          initiatedCandidateJobMatchingId: string;
          } | {
            failedCandidateJobMatchingScores: { candidateParsedCvId: string, error?: string }
          } | {
            existingMatchingScore: DbCandidateJobMatchingDto | DbUserJobApplicationDto;
        } = await this.findMatchingScoreBulkCandidateParsedCv(
          jobDetails.companyId as string,
          jobId,
          candidateId,
          actionByCorporateUserId,
          actionByUserId
        );
        if('initiatedCandidateJobMatchingId' in result && result.initiatedCandidateJobMatchingId) {
          initiatedCandidateJobMatchingIds.push({ candidateParsedCvId: candidateId, candidateJobMatchingId: result.initiatedCandidateJobMatchingId });
        } else if('existingMatchingScore' in result && result.existingMatchingScore) {
          existingMatchingScores.push({ candidateParsedCvId: candidateId, ...result.existingMatchingScore });
        } else if('failedCandidateJobMatchingScores' in result && result.failedCandidateJobMatchingScores) {
          failedCandidateParsedCvs.push(result.failedCandidateJobMatchingScores);
        } else {
          global.logger.error("Unexpected error. Failed to find matching score", {
            methodName: this.performFindMatchingScoreBulkCandidateParsedCv.name,
            result
          })
          failedCandidateParsedCvs.push({ candidateParsedCvId: candidateId, error: "Unexpected error. Failed to find matching score" });
        }
      } catch (error: any) {
        global.logger.error("Failed to find matching score", {
          methodName: this.performFindMatchingScoreBulkCandidateParsedCv.name,
          error
        })
        failedCandidateParsedCvs.push({ candidateParsedCvId: candidateId, error: "Catch block error" });
      }
    });

    // Promise.allSettled waits for all the promises to resolve or reject
    await Promise.allSettled(bulkPromises);

    return {
      existingCandidateJobMatchingScores: existingMatchingScores,
      initiatedCandidateJobMatchingScores: initiatedCandidateJobMatchingIds,
      failedCandidateJobMatchingScores: failedCandidateParsedCvs,
    };
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

  async parseSubmitFormCandidateParsedCvAsync(
    validatedReqBody: CandidateParsedCvParseSubmitFormApiDto
  ) {
    const invokeData:InvokeLambdaSubmitFormCandidateParsedCvActivityDto = validatedReqBody;
    return InvokeLambdaService.triggerWorkoCorpAppInvokeLambdaTrigger({
      eventType: InvokeLambdaHandlerEventTypeEnum.CANDIDATE_SUBMIT_CV_FOR_JOB,
      data: invokeData,
    });
  }

  async parseSubmitFormCandidateParsedCv(
    validatedReqBody: CandidateParsedCvParseSubmitFormApiDto
  ) {
    const { 
      jobId: reqBodyJobId, 
      candidateParsedCvAwsS3FileName, 
      companyId: reqBodyCompanyId,
    } = validatedReqBody;

    const reqBodyCompanyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(reqBodyCompanyId);
    if (!reqBodyCompanyDetails.count) {
      throw new BaseError(
        `Company details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const reqBodyCompanyData: DbCompanyDetailDto = reqBodyCompanyDetails[0];

    const reqBodyJobData: DbGcpFirestoreJobDto | undefined =
      await gcpFirestoreJobServiceObj.getJobById(reqBodyJobId);
    if (!reqBodyJobData) {
      throw new BaseError(
        `Job details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    if(!reqBodyJobData.companyId) {
      global.logger.error(`Job does not belong to any company.`, {
        methodName: this.parseSubmitFormCandidateParsedCv.name,
        reqBodyJobData,
      });
      throw new BaseError(
        `Job does not belong to any company.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    const parsedCvDetails: APIGatewayProxyResult =
      await InvokeLambdaService.triggerParseSubmitFormCandidateParsedCv({
        companyId: reqBodyJobData.companyId,
        jobId: reqBodyJobId,
        candidateParsedCvAwsS3FileName,
        cvAwsS3ResourceType: CandidateParsedCvAwsS3ResourceTypeEnum.CAND_SUBMIT_CV_JOB
      });
    if (parsedCvDetails.statusCode !== HttpStatusCode.OK_200) {
      global.logger.error(`Failed to parse CV.`, {
        methodName: this.parseSubmitFormCandidateParsedCv.name,
        parsedCvDetails,
      });
      throw new BaseError(
        "Failed to parse CV.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const parsedCvData: CandidateParsedCvParseSubmitFormResponseDto =
      JSON.parse(parsedCvDetails.body);
    global.logger.info(`Parsed CV.`, {
      methodName: this.parseSubmitFormCandidateParsedCv.name,
      parsedCvData,
    })

    if (!parsedCvData.email || !parsedCvData.phoneNumberDetails) {
      global.logger.error(`Candidate email or phone number not found in parsed CV..`, {
        methodName: this.parseSubmitFormCandidateParsedCv.name,
        parsedCvData,
      });
      throw new BaseError(
        "Candidate email or phone number not found in CV.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const existingCandidateProfile: QuerySnapshot<DocumentData, DocumentData> =
      await corporateCandidateProfileServiceObj.getDuplicateCorporateCandidateProfile(
        reqBodyJobData.companyId,
        parsedCvData.email, // candidate email
        parsedCvData.phoneNumberDetails // candidate phone number details
      );
    let duplicateCorporateCandidateProfile: DbCorporateCandidateProfileDto | undefined;
    if (!existingCandidateProfile.empty) {
      global.logger.error(
        `Candidate is already submitted for the company job.`,
        {
          methodName: this.parseSubmitFormCandidateParsedCv.name,
          reqBodyJobId,
          parsedCvData,
          duplicateCandidateProfile: existingCandidateProfile.docs[0].data(),
        }
      );
      global.logger.error(`Duplicate profile.`, {
        methodName: this.parseSubmitFormCandidateParsedCv.name,
      });
      duplicateCorporateCandidateProfile = existingCandidateProfile.docs[0].data() as DbCorporateCandidateProfileDto;
    }

    return {
      parsedCvData: {
        ...parsedCvData,
        noticePeriod: validatedReqBody.noticePeriod,
        expectedCTC: validatedReqBody.expectedCTC,
        currentCTC: validatedReqBody.currentCTC,
      },
      duplicateCorporateCandidateProfile,
      reqBodyJobData,
      reqBodyCompanyData
    };
  }

  async createSubmitFormCandidateParsedCv(
    reqBody: CandidateParsedCvSubmitFormCreateApiDto,
    reqBodyJobData: DbGcpFirestoreJobDto,
    reqBodyCompanyData: DbCompanyDetailDto
  ) {
    const { companyId: reqBodyCompanyId, jobId: reqBodyJobId, cvAwsS3FileName } = reqBody;

    const bucketName: string | undefined =
      process.env.APP_AWS_S3_BUCKET_WORKO_APP;
    if (!bucketName) {
      global.logger.error(`AWS S3 bucket name not found. [File Service]`, {
        bucketName,
        methodName: this.createSubmitFormCandidateParsedCv.name,
      });

      throw new BaseError(
        `Internal server error.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const currentDate: string = dateHelperObj.getISODate();

    /**
     * Prepare data to Store Candidate parsed details in "CandidateParsedCv" model
     */
    const candidateParsedCvCreateData: DbCandidateParsedCvDto = {
      ...reqBody,
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      // userDetailId: candidateDetails?.id,
      cvAwsS3ResourceType: CandidateParsedCvAwsS3ResourceTypeEnum.CAND_SUBMIT_CV_JOB,
      cvAwsS3BucketName: bucketName,
      cvAwsS3FilePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.CAND_SUBMIT_CV_JOB.strtr({
        "{companyId}": reqBodyCompanyId,
        "{jobId}": reqBodyJobId,
      }),
      cvAwsS3FileTracker: [
        {
          actionDate: currentDate,
          resourceType: CandidateParsedCvAwsS3ResourceTypeEnum.CAND_SUBMIT_CV_JOB,
          bucketName: bucketName,
          filePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.CAND_SUBMIT_CV_JOB.strtr({
            "{companyId}": reqBodyCompanyId,
            "{jobId}": reqBodyJobId,
          }),
          fileName: reqBody.cvAwsS3FileName,
        }
      ]
    };

    let refereeTypeForCorpCandProfile: CorporateCandidateProfileDbRefereeTypeEnum;
    let refereeTypeForCentralCandProfile: CentralCandidateProfileDbRefereeTypeEnum;
    if(reqBodyJobData.createdByCorporateUserId) {
      refereeTypeForCorpCandProfile = CorporateCandidateProfileDbRefereeTypeEnum.INTERNAL;
      refereeTypeForCentralCandProfile = CentralCandidateProfileDbRefereeTypeEnum.INTERNAL;
    } else {
      refereeTypeForCorpCandProfile = CorporateCandidateProfileDbRefereeTypeEnum.WORKO;
      refereeTypeForCentralCandProfile = CentralCandidateProfileDbRefereeTypeEnum.WORKO;
    }

    const corporateCandidateProfileCreateData: DbCorporateCandidateProfileDto = {
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      companyId: reqBodyCompanyId,
      jobId: reqBodyJobId,
      candidateEmail: reqBody.email,
      refereeType: refereeTypeForCorpCandProfile,
      candidateParsedCvId: candidateParsedCvCreateData.id,
      phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails,
      // userDetailId: candidateDetails?.id
    };

    candidateParsedCvCreateData.corporateCandidateProfileId = corporateCandidateProfileCreateData.id;

    const existingCentralCandidateProfile: DbCentralCandidateProfileDto | undefined =
      await centralCandidateProfileServiceObj.getCentralCandidateProfileById(
        reqBody.email
      );

    let createOrUpdateCentralCandidateProfile: Promise<DbCentralCandidateProfileDto | undefined>;

    if(existingCentralCandidateProfile) {
      createOrUpdateCentralCandidateProfile = centralCandidateProfileServiceObj.updateCentralCandidateProfileById(
        reqBody.email,
        {
          updatedAt: currentDate,
          candidateProfileInCompanies: [
            ...(existingCentralCandidateProfile?.candidateProfileInCompanies ?? []),
            {
              companyId: reqBodyCompanyId,
              companyName: reqBodyCompanyData.name,
              jobIds: [reqBodyJobId]
            }
          ],
          corporateCandidateProfileIds: [
            ...(existingCentralCandidateProfile?.corporateCandidateProfileIds ?? []),
            corporateCandidateProfileCreateData.id
          ],
          candidateParsedCvIds: [
            ...(existingCentralCandidateProfile?.candidateParsedCvIds ?? []),
            candidateParsedCvCreateData.id
          ],
          latestCandidateParsedCvId: candidateParsedCvCreateData.id,
        }
      )
    } else {
      let createCentralCandidateProfileData: DbCentralCandidateProfileDto = {
        id: reqBody.email,
        createdAt: currentDate,
        updatedAt: currentDate,
        candidateEmail: reqBody.email,
        phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails,
        refereeType: refereeTypeForCentralCandProfile,
        // userDetailId: candidateDetails?.id,
        candidateProfileInCompanies: [
          {
            companyId: reqBodyCompanyId,
            companyName: reqBodyCompanyData.name,
            jobIds: [reqBodyJobId],
          },
        ],
        corporateCandidateProfileIds: [corporateCandidateProfileCreateData.id],
        candidateParsedCvIds: [candidateParsedCvCreateData.id],
        latestCandidateParsedCvId: candidateParsedCvCreateData.id,
      };

      createOrUpdateCentralCandidateProfile = centralCandidateProfileServiceObj.createCentralCandidateProfile(createCentralCandidateProfileData);
    }

    const createSubmitFormCandidateParsedCv: [
      DbCandidateParsedCvDto | undefined, 
      DbCorporateCandidateProfileDto | undefined, 
      DbCentralCandidateProfileDto | undefined
    ] = await Promise.all([
      candidateParsedCvServiceObj.createCandidateParsedCvWithEmbedding(
        candidateParsedCvCreateData
      ),
      corporateCandidateProfileServiceObj.createCorporateCandidateProfile(corporateCandidateProfileCreateData),
      createOrUpdateCentralCandidateProfile,
    ]);

    if(!createSubmitFormCandidateParsedCv[0] || !createSubmitFormCandidateParsedCv[1] || !createSubmitFormCandidateParsedCv[2]) {
      throw new BaseError("Failed to create candidate parsed cv, corporate candidate profile and central candidate profile.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return createSubmitFormCandidateParsedCv[0];
  }

  async processSubmitFormCandidateParsedCvActivity(
    data: InvokeLambdaSubmitFormCandidateParsedCvActivityDto
  ) {
    const parseSubmitFormCandidateParsedCv: {
      parsedCvData: CandidateParsedCvParseSubmitFormResponseDto;
      duplicateCorporateCandidateProfile: DbCorporateCandidateProfileDto | undefined;
      reqBodyJobData: DbGcpFirestoreJobDto;
      reqBodyCompanyData: DbCompanyDetailDto;
    } = await this.parseSubmitFormCandidateParsedCv(data);

    let candidateParsedCvId: string;
    let candidateEmail: string;
    let candidateName: string;

    // If duplicate corporate candidate profile is found, then we don't need to create a new candidate parsed cv
    if(!parseSubmitFormCandidateParsedCv.duplicateCorporateCandidateProfile) {
      const createSubmitFormCandidateParsedCv: DbCandidateParsedCvDto = await this.createSubmitFormCandidateParsedCv(
        {
          ...parseSubmitFormCandidateParsedCv.parsedCvData,
          companyId: data.companyId,
          jobId: data.jobId,
          cvAwsS3FileName: data.candidateParsedCvAwsS3FileName
        },
        parseSubmitFormCandidateParsedCv.reqBodyJobData,
        parseSubmitFormCandidateParsedCv.reqBodyCompanyData
      );
      candidateParsedCvId = createSubmitFormCandidateParsedCv.id;
      candidateEmail = createSubmitFormCandidateParsedCv.email;
      candidateName = createSubmitFormCandidateParsedCv.name;
    } else {
      candidateParsedCvId = parseSubmitFormCandidateParsedCv.duplicateCorporateCandidateProfile.candidateParsedCvId;
      candidateEmail = parseSubmitFormCandidateParsedCv.duplicateCorporateCandidateProfile.candidateEmail;
      candidateName = parseSubmitFormCandidateParsedCv.parsedCvData.name;
    }

    const moveToApplicantCandidateParsedCv: boolean = await this.moveToApplicantSubmitFormCandidateParsedCv({
      candidateParsedCvId,
      jobId: data.jobId,
      companyName: parseSubmitFormCandidateParsedCv.reqBodyCompanyData.name,
      jobTitle: parseSubmitFormCandidateParsedCv.reqBodyJobData.jobTitle
    });

    const toAddress: EmailSourceDestinationAddress = {
      email: candidateEmail,
      fullName: candidateName.toTitleCase(),
    };

    if(moveToApplicantCandidateParsedCv) {
      const emailPlaceholders: EmailTemplatePlaceholderCAND_SUCCESS_SUBMIT_FORM_FOR_JOB =
        {
          candidateName: candidateName.toTitleCase(),
          jobTitle: parseSubmitFormCandidateParsedCv.reqBodyJobData.jobTitle.toTitleCase(),
          companyName: parseSubmitFormCandidateParsedCv.reqBodyCompanyData.name.toTitleCase(),
          dateApplied: dateHelperObj.getCurrentDayMonthYearFormattedDate(),
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      await emailLibrary.sendEmail(
        EmailTemplateEnum.CAND_SUCCESS_SUBMIT_FORM_FOR_JOB,
        toAddress,
        emailPlaceholders
      );
    } else {
      const emailPlaceholders: EmailTemplatePlaceholderCAND_DUPLICATE_JOB_APPLICATION_SUBMIT_FORM_FOR_JOB =
        {
          candidateName: candidateName.toTitleCase(),
          jobTitle: parseSubmitFormCandidateParsedCv.reqBodyJobData.jobTitle.toTitleCase(),
          companyName: parseSubmitFormCandidateParsedCv.reqBodyCompanyData.name.toTitleCase(),
          dateApplied: dateHelperObj.getCurrentDayMonthYearFormattedDate(),
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      await emailLibrary.sendEmail(
        EmailTemplateEnum.CAND_DUPLICATE_JOB_APPLICATION_SUBMIT_FORM_FOR_JOB,
        toAddress,
        emailPlaceholders
      );
    }
  }
}

const candidateParsedCvServiceObj = new CandidateParsedCvService();
export { candidateParsedCvServiceObj, CandidateParsedCvService };