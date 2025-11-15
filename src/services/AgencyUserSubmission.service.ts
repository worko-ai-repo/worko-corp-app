
// Import aws lambda related types
import { APIGatewayProxyResult } from "aws-lambda";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import google cloud firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import dtos
import { AgencyUserSubmissionCandidateParseCvApiDto, AgencyUserSubmissionCandidateParseCvResponseDto, AgencyUserSubmissionCreateApiDto, AgencyUserSubmissionListingFilterOptions } from "../dtos/AgencyUserSubmission.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import daos
import { agencyUserSubmissionDaoObj } from "../daos/AgencyUserSubmission.dao";
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";
import { candidateProfileDaoObj } from "../daos/CandidateProfile.dao";

// Import enums
import { CandidateProfileDbRefereeTypeEnum } from "../enums/CandidateProfile.enum";

// Import helpers
import { getActionByAgencyUserIds, getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";
import { DbCompanyJobDto } from "../db/aws-dynamodb-models/CompanyJob.model";
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbCandidateProfileDto } from "../db/gcp-firestore-models/CandidateProfile.model";
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";

// Import services
import { agencyUserServiceObj } from "./AgencyUser.service";
import { companyDetailServiceObj } from "./CompanyDetail.service";
import { companyJobServiceObj } from "./CompanyJob.service";
import { agencyJobAssignmentServiceObj } from "./AgencyJobAssignment.service";
import InvokeLambdaService from "./InvokeLambda.service";
import UlidService from "./Ulid.service";
import UserDetailService from "./UserDetail.service";
import { candidateProfileServiceObj } from "./CandidateProfile.service";
import { corporateUserServiceObj } from "./CorporateUser.service";
import { agencyUserInviteServiceObj } from "./AgencyUserInvite.service";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";


class AgencyUserSubmissionService {
  private async validateAgencyUserSubmissionCompanyJobPermissions(
    reqBodyCompanyId: string,
    reqBodyJobId: string
  ): Promise<{
    agencyUserDetails: DbAgencyUserDto;
    reqBodyCompanyData: DbCompanyDetailDto;
    reqBodyJobData: DbCompanyJobDto;
    jobAssignedToAgency: DbAgencyJobAssignmentDto;
  }> {
    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();
    const agencyUserDetails: DbAgencyUserDto | undefined =
      await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId
      );
    if (!agencyUserDetails) {
      global.logger.error(`Agency User Details not found.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        convertedAgencyCognitoUserId,
      });
      throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
    }

    const reqBodyCompanyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(reqBodyCompanyId);
    if (!reqBodyCompanyDetails.count) {
      throw new BaseError(
        `Company details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const reqBodyCompanyData: DbCompanyDetailDto = reqBodyCompanyDetails[0];

    const reqBodyJobDetails: QueryResponse<DbCompanyJobDto> =
      await companyJobServiceObj.getJobById(reqBodyJobId);
    if (!reqBodyJobDetails.count) {
      throw new BaseError(
        `Job details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const reqBodyJobData: DbCompanyJobDto = reqBodyJobDetails[0];

    if (reqBodyCompanyData.id !== reqBodyJobData.companyId) {
      global.logger.error(`Job does not belong to the company.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        reqBodyCompanyId,
        reqBodyJobId,
        reqBodyCompanyData,
        reqBodyJobData,
      });
      throw new BaseError(
        `You are not allowed to perform this action.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    /**
     * Check whether this "companyJob" is assigned to this "agency" or not by using "companyId" "agencyRegisteredEmail","jobId" in "AgencyJobAssignment" model
     */
    const jobAssignedToAgency: QuerySnapshot<DocumentData, DocumentData> =
      await agencyJobAssignmentServiceObj.getAgencyJobAssignmentByCompIdJobIdAndEmail(
        reqBodyCompanyId,
        reqBodyJobId,
        agencyUserDetails.email
      );
    if (jobAssignedToAgency.empty) {
      global.logger.error(`Job is not assigned to the agency.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        reqBodyCompanyId,
        reqBodyJobId,
        reqBodyCompanyData,
        reqBodyJobData,
      });
      throw new BaseError(
        `You are not allowed to perform this action.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    return {
      agencyUserDetails,
      reqBodyCompanyData,
      reqBodyJobData,
      jobAssignedToAgency:
        jobAssignedToAgency.docs[0].data() as DbAgencyJobAssignmentDto,
    };
  }

  async parseAgencyUserSubmissionCandidateCv(
    validatedReqBody: AgencyUserSubmissionCandidateParseCvApiDto
  ) {
    global.logger.info(`Parse Agency User Submission Candidate CV [Service]`, {
      methodName: this.parseAgencyUserSubmissionCandidateCv.name,
    });

    const { companyId: reqBodyCompanyId, jobId: reqBodyJobId } =
      validatedReqBody;

    const validateAgencyUserCompanyJobDetails: {
      agencyUserDetails: DbAgencyUserDto;
      reqBodyCompanyData: DbCompanyDetailDto;
      reqBodyJobData: DbCompanyJobDto;
      jobAssignedToAgency: DbAgencyJobAssignmentDto;
    } = await this.validateAgencyUserSubmissionCompanyJobPermissions(
      reqBodyCompanyId,
      reqBodyJobId
    );

    const parsedCvDetails: APIGatewayProxyResult =
      await InvokeLambdaService.triggerParseAgencyUserSubmissionCandidateCv({
        companyId: reqBodyCompanyId,
        jobId: reqBodyJobId,
        agencyUserId: validateAgencyUserCompanyJobDetails.agencyUserDetails.id,
        candidateParsedCvAwsS3FileName:
          validatedReqBody.candidateParsedCvAwsS3FileName,
      });
    if (parsedCvDetails.statusCode !== HttpStatusCode.OK_200) {
      global.logger.error(`Failed to parse CV.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        parsedCvDetails,
      });
      throw new BaseError(
        "Failed to parse CV.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const parsedCvData: AgencyUserSubmissionCandidateParseCvResponseDto =
      JSON.parse(parsedCvDetails.body);

    if (!parsedCvData.email) {
      global.logger.error(`Candidate email not found in parsed CV..`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        parsedCvData,
      });
      throw new BaseError(
        "Failed to parse CV.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const existingCandidateProfile: QuerySnapshot<DocumentData, DocumentData> =
      await candidateProfileServiceObj.getDuplicateCandidateProfile(
        reqBodyCompanyId,
        parsedCvData.email, // candidate email
        parsedCvData.phoneNumberDetails // candidate phone number details
      );
    if (!existingCandidateProfile.empty) {
      global.logger.error(
        `Candidate is already submitted for the company job.`,
        {
          methodName: this.parseAgencyUserSubmissionCandidateCv.name,
          reqBodyCompanyId,
          reqBodyJobId,
          parsedCvData,
          duplicateCandidateProfile: existingCandidateProfile.docs[0].data(),
        }
      );
      throw new BaseError(`Duplicate profile.`, HttpStatusCode.CONFLICT_409);
    }

    return parsedCvData;
  }

  async performCreateAgencyUserSubmissionActivities(
    validatedReqBody: AgencyUserSubmissionCreateApiDto
  ): Promise<DbAgencyUserSubmissionDto> {
    global.logger.info(
      `Perform Create Agency User Submission Activities [Service]`,
      {
        methodName: this.performCreateAgencyUserSubmissionActivities.name,
      }
    );

    const {
      companyId: reqBodyCompanyId,
      jobId: reqBodyJobId,
      agencyComments,
      agencyUserInviteId,
      ...candidateParsedCvData
    } = validatedReqBody;

    const { email: reqBodyParsedCvCandidateEmail } = candidateParsedCvData;

    const validatedAgencyUserCompanyJobDetails: {
      agencyUserDetails: DbAgencyUserDto;
      reqBodyCompanyData: DbCompanyDetailDto;
      reqBodyJobData: DbCompanyJobDto;
      jobAssignedToAgency: DbAgencyJobAssignmentDto;
    } = await this.validateAgencyUserSubmissionCompanyJobPermissions(
      reqBodyCompanyId,
      reqBodyJobId
    );

    const { agencyUserDetails, jobAssignedToAgency } =
      validatedAgencyUserCompanyJobDetails;

    const existingCandidateProfile: QuerySnapshot<DocumentData, DocumentData> =
      await candidateProfileServiceObj.getDuplicateCandidateProfile(
        reqBodyCompanyId,
        reqBodyParsedCvCandidateEmail,
        candidateParsedCvData.phoneNumberDetails
      );
    if (!existingCandidateProfile.empty) {
      global.logger.error(`Candidate is already submitted for the company.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        reqBodyCompanyId,
        reqBodyJobId,
        duplicateCandidateProfile: existingCandidateProfile.docs[0].data(),
      });
      throw new BaseError(`Duplicate profile.`, HttpStatusCode.CONFLICT_409);
    }

    // Check whether the inviteId is present in agencyUserDetails.inviteIds or not
    const isInviteIdPresentInAgencyUserDetails: boolean =
      agencyUserDetails.inviteIds.includes(agencyUserInviteId);
    if (!isInviteIdPresentInAgencyUserDetails) {
      global.logger.error(`Invalid inviteId.`, {
        methodName: this.performCreateAgencyUserSubmissionActivities.name,
        inviteId: agencyUserInviteId,
        agencyUserDetails,
      });
      throw new BaseError(
        `You are not allowed to access this resource.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    const reqBodyAgencyInviteDetails: DbAgencyUserInviteDto | undefined =
      await agencyUserInviteServiceObj.getAgencyUserInviteById(
        agencyUserInviteId
      );
    if (!reqBodyAgencyInviteDetails) {
      global.logger.error(`Agency User Invite Details not found.`, {
        methodName: this.performCreateAgencyUserSubmissionActivities.name,
        agencyUserInviteId,
      });
      throw new BaseError(
        `You are not allowed to access this resource.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    const currentDate: string = dateHelperObj.getISODate();

    /**
     * Prepare data to Store Candidate parsed details in "CandidateParsedCv" model
     */
    const candidateParsedCvCreateData: DbCandidateParsedCvDto = {
      ...candidateParsedCvData,
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    /**
     * Prepare data to Store Agency User Submission details in "AgencyUserSubmission" model
     */
    const agencyUserSubmissionCreateData: DbAgencyUserSubmissionDto = {
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      companyId: reqBodyCompanyId,
      jobId: reqBodyJobId,
      candidateEmail: reqBodyParsedCvCandidateEmail,
      candidateParsedCvId: candidateParsedCvCreateData.id,
      agencyUserId: agencyUserDetails.id,
      agencyRegisteredEmail: agencyUserDetails.email,
      agencyUserInviteId: agencyUserInviteId,
      agencyName: reqBodyAgencyInviteDetails.agencyName,
      agencyJobAssignmentId: jobAssignedToAgency.id,
      agencyComments,
      agencyJobAssignedByCorporateUserId:
        jobAssignedToAgency.assignedByCorporateUserId,
      agencyJobAssignedByUserId: jobAssignedToAgency.assignedByUserId,
    };

    /**
     * Prepare data to Store Agency User Submission details in "CandidateProfile" model
     */
    const candidateProfileCreateData: DbCandidateProfileDto = {
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      companyId: reqBodyCompanyId,
      jobId: reqBodyJobId,
      candidateEmail: reqBodyParsedCvCandidateEmail,
      refereeType: CandidateProfileDbRefereeTypeEnum.AGENCY,
      candidateParsedCvId: candidateParsedCvCreateData.id,
      agencyUserSubmissionId: agencyUserSubmissionCreateData.id,
      phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails,
    };

    const candidateRegisteredDetails: QueryResponse<DbUserDetailDto> =
      await UserDetailService.get(reqBodyParsedCvCandidateEmail);
    if (candidateRegisteredDetails.count) {
      const userDetailData: DbUserDetailDto = candidateRegisteredDetails[0];
      agencyUserSubmissionCreateData.userDetailId = userDetailData.id;
      candidateProfileCreateData.userDetailId = userDetailData.id;
    }

    const createAgencyUserSubmissionResult: [
      DbCandidateParsedCvDto | undefined,
      DbAgencyUserSubmissionDto | undefined,
      DbCandidateProfileDto | undefined
    ] = await Promise.all([
      candidateParsedCvDaoObj.createCandidateParsedCv(
        candidateParsedCvCreateData
      ),
      this.createAgencyUserSubmission(agencyUserSubmissionCreateData),
      candidateProfileDaoObj.createCandidateProfile(candidateProfileCreateData),
    ]);

    // If any of the result is failed to create then throw error
    if (
      !createAgencyUserSubmissionResult[0] ||
      !createAgencyUserSubmissionResult[1] ||
      !createAgencyUserSubmissionResult[2]
    ) {
      global.logger.error(`Failed to create Agency User Submission.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        createAgencyUserSubmissionResult,
      });

      /**
       * @todo: Need to implement "rollback" functionality if any of the result is failed to create
       */

      throw new BaseError(
        `Failed to Submit Candidate Profile.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    return createAgencyUserSubmissionResult[1];
  }

  async createAgencyUserSubmission(
    createData: DbAgencyUserSubmissionDto
  ): Promise<DbAgencyUserSubmissionDto | undefined> {
    global.logger.info(`Create Agency User Submission [Service]`, {
      methodName: this.createAgencyUserSubmission.name,
    });

    return agencyUserSubmissionDaoObj.createAgencyUserSubmission(createData);
  }

  async performGetAllAgencyUserSubmissionActivities(
    filterOptions: AgencyUserSubmissionListingFilterOptions
  ): Promise<
    GcpFirestoreRecordListingResponseDTO<
      (DbAgencyUserSubmissionDto & {
        jobDetails?: DbJobAwsOpensearchDto;
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[]
    >
  > {
    /**
     * If action by user is "agency"
     */
    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();
    const agencyUserDetails: DbAgencyUserDto | undefined =
      await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId
      );
    if (agencyUserDetails) {
      if (!filterOptions.agencyRegisteredEmail) {
        global.logger.info(
          `To list user submissions to particular agency, agency registeredEmail is required`,
          {
            methodName: this.performGetAllAgencyUserSubmissionActivities.name,
            filterOptions,
          }
        );
        throw new BaseError(
          "Agency email is required",
          HttpStatusCode.BAD_REQUEST_400
        );
      }

      if (filterOptions.agencyRegisteredEmail !== agencyUserDetails.email) {
        global.logger.info(
          `To list user submissions to particular agency, agencyEmail should match`,
          {
            methodName: this.performGetAllAgencyUserSubmissionActivities.name,
            filterOptions,
            agencyUserDetails,
            convertedAgencyCognitoUserId,
          }
        );
        throw new BaseError(
          "You are not allowed to access this resource",
          HttpStatusCode.FORBIDDEN_403
        );
      }
    }

    const { actionByCorporateUserId } = getActionByUserId();

    /**
     * If action by user is "corporate-admin/recruiter", then list invites which are sent by him and from his company
     */
    if (actionByCorporateUserId) {
      if (!filterOptions.companyId) {
        global.logger.info(
          `To list user submissions for particular corporate user, companyId is required`,
          {
            methodName: this.performGetAllAgencyUserSubmissionActivities.name,
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

      if(corporateUserData.isDeleted) {
        global.logger.error(`Corporate user account is deleted.`, {
          methodName: this.performGetAllAgencyUserSubmissionActivities.name,
          corporateUserData,
        });
        throw new BaseError("You are not allowed to access this resource", HttpStatusCode.FORBIDDEN_403);
      }

      if (filterOptions.companyId !== corporateUserData.companyId) {
        global.logger.info(
          `To list user submissions for particular corporate user, companyId should match`,
          {
            methodName: this.performGetAllAgencyUserSubmissionActivities.name,
            filterOptions,
            corporateUserData,
          }
        );
        throw new BaseError(
          "You are not allowed to access this resource",
          HttpStatusCode.FORBIDDEN_403
        );
      }
    }

    // If job details and candidate parsed cv details are not required then list without them.
    if (
      !filterOptions.includeJobDetails &&
      !filterOptions.includeCandidateParsedCvDetails
    ) {
      return this.getAllAgencyUserSubmissionByFilterOptions(filterOptions);
    }

    const { data: agencyUserSubmissions, pagination } =
      await this.getAllAgencyUserSubmissionByFilterOptions(filterOptions);

    const agencyUserSubmissionsWithEntityDetails: (DbAgencyUserSubmissionDto & {
      jobDetails?: DbJobAwsOpensearchDto;
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[] =
      await injectEntityDetailsHelperObj.injectEntityDetailsForAgencyUserSubmission(
        agencyUserSubmissions,
        filterOptions.includeJobDetails,
        filterOptions.includeCandidateParsedCvDetails
      );

    const finalResponse: GcpFirestoreRecordListingResponseDTO<
      (DbAgencyUserSubmissionDto & {
        jobDetails?: DbJobAwsOpensearchDto;
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[]
    > = {
      data: agencyUserSubmissionsWithEntityDetails,
      pagination: pagination,
    };

    return finalResponse;
  }

  async getAllAgencyUserSubmissionByFilterOptions(
    filterOptions: AgencyUserSubmissionListingFilterOptions
  ): Promise<
    GcpFirestoreRecordListingResponseDTO<DbAgencyUserSubmissionDto[]>
  > {
    return agencyUserSubmissionDaoObj.getAllAgencyUserSubmissionByFilterOptions(
      filterOptions
    );
  }
}

const agencyUserSubmissionServiceObj = new AgencyUserSubmissionService();
export { agencyUserSubmissionServiceObj, AgencyUserSubmissionService };