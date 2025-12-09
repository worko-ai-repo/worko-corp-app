
// Import aws lambda related types
import { APIGatewayProxyResult } from "aws-lambda";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import google cloud firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import aws packages
import { AdminCreateUserCommandOutput } from "@aws-sdk/client-cognito-identity-provider";

// Import luxon
import { DateTime } from "luxon";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";
import { awsClientCognitoIdentityProviderLibrary } from "../configs/aws-sdk.config";

// Import dtos
import { AgencyUserSubmissionBulkFindMatchingScoreApiDto, AgencyUserSubmissionCandidateParseCvApiDto, AgencyUserSubmissionCandidateParseCvResponseDto, AgencyUserSubmissionCreateApiDto, AgencyUserSubmissionFindMatchingScoreApiDto, AgencyUserSubmissionInvokedMatchingScoreResponseDto, AgencyUserSubmissionListingFilterOptions, AgencyUserSubmissionMoveToApplicantCreateApiDTO, AgencyUserSubmissionRejectApplicantCreateApiDTO, AgencyUserSubmissionSendForEvaluationCreateApiDTO } from "../dtos/AgencyUserSubmission.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import daos
import { agencyUserSubmissionDaoObj } from "../daos/AgencyUserSubmission.dao";

// Import dtos
import { UserDetailCreateDto } from "../dtos/UserDetail.dto";

// Import enums
import { CorporateCandidateProfileDbRefereeTypeEnum } from "../enums/CorporateCandidateProfile.enum";
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";
import { AgencyUserSubmissionDbJobApplicationStatusEnum } from "../enums/AgencyUserSubmission.enum";
import { AgencyJobAssignmentDbStatusEnum } from "../enums/AgencyJobAssignment.enum";
import { UserType } from "../enums/User.enum";

// Import helpers
import { getActionByAgencyUserIds, getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";
import { DbCompanyJobDto } from "../db/aws-dynamodb-models/CompanyJob.model";
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbUserJobApplicationDto } from "../db/aws-dynamodb-models/UserJobApplication.model";

// Import services
import { agencyUserServiceObj } from "./AgencyUser.service";
import { companyDetailServiceObj } from "./CompanyDetail.service";
import { companyJobServiceObj } from "./CompanyJob.service";
import { agencyJobAssignmentServiceObj } from "./AgencyJobAssignment.service";
import InvokeLambdaService from "./InvokeLambda.service";
import UlidService from "./Ulid.service";
import UserDetailService from "./UserDetail.service";
import { corporateCandidateProfileServiceObj } from "./CorporateCandidateProfile.service";
import { corporateUserServiceObj } from "./CorporateUser.service";
import { agencyUserInviteServiceObj } from "./AgencyUserInvite.service";
import { centralCandidateProfileServiceObj } from "./CentralCandidateProfile.service";
import { candidateParsedCvServiceObj } from "./CandidateParsedCv.service";
import { userJobApplicationServiceObj } from "./UserJobApplication.service";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";

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

    const jobAssignedToAgencyData = jobAssignedToAgency.docs[0].data() as DbAgencyJobAssignmentDto;

    if(jobAssignedToAgencyData.status !== AgencyJobAssignmentDbStatusEnum.ACTIVE) {
      global.logger.error(`Job is not active.`, {
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
      jobAssignedToAgency: jobAssignedToAgencyData,
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
        "Candidate email not found in CV.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const existingCandidateProfile: QuerySnapshot<DocumentData, DocumentData> =
      await corporateCandidateProfileServiceObj.getDuplicateCorporateCandidateProfile(
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

    const { agencyUserDetails, jobAssignedToAgency, reqBodyCompanyData } =
      validatedAgencyUserCompanyJobDetails;

    const existingCandidateProfile: QuerySnapshot<DocumentData, DocumentData> =
      await corporateCandidateProfileServiceObj.getDuplicateCorporateCandidateProfile(
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

    const candidateRegisteredDetails: QueryResponse<DbUserDetailDto> =
      await UserDetailService.get(reqBodyParsedCvCandidateEmail);
    let candidateDetails: DbUserDetailDto | undefined;
    if(candidateRegisteredDetails.count) {
      candidateDetails = candidateRegisteredDetails[0];
    }

    const bucketName: string | undefined =
      process.env.APP_AWS_S3_BUCKET_WORKO_APP;
    if (!bucketName) {
      global.logger.error(`AWS S3 bucket name not found. [File Service]`, {
        bucketName,
        methodName: this.performCreateAgencyUserSubmissionActivities.name,
      });

      throw new BaseError(
        `Internal server error.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    /**
     * Prepare data to Store Candidate parsed details in "CandidateParsedCv" model
     */
    const candidateParsedCvCreateData: DbCandidateParsedCvDto = {
      ...candidateParsedCvData,
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      agencyUserId: agencyUserDetails.id,
      agencyRegisteredEmail: agencyUserDetails.email,
      companyId: reqBodyCompanyId,
      jobId: reqBodyJobId,
      userDetailId: candidateDetails?.id,
      cvAwsS3ResourceType: CandidateParsedCvAwsS3ResourceTypeEnum.AGENCY_SUBMIT_USER_CV,
      cvAwsS3BucketName: bucketName,
      cvAwsS3FilePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.AGENCY_SUBMIT_USER_CV.strtr({
        "{agencyUserId}": agencyUserDetails.id,
        "{companyId}": reqBodyCompanyId,
        "{jobId}": reqBodyJobId,
      }),
      cvAwsS3FileTracker: [
        {
          actionDate: currentDate,
          resourceType: CandidateParsedCvAwsS3ResourceTypeEnum.AGENCY_SUBMIT_USER_CV,
          bucketName: bucketName,
          filePath: APP_CONSTANTS.AWS_S3_DIR_PATHS.AGENCY_SUBMIT_USER_CV.strtr({
            "{agencyUserId}": agencyUserDetails.id,
            "{companyId}": reqBodyCompanyId,
            "{jobId}": reqBodyJobId,
          }),
          fileName: candidateParsedCvData.cvAwsS3FileName,
        }
      ]
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

    candidateParsedCvCreateData.agencyUserSubmissionId = agencyUserSubmissionCreateData.id;

    /**
     * Prepare data to Store Agency User Submission details in "CandidateProfile" model
     */
    const corporateCandidateProfileCreateData: DbCorporateCandidateProfileDto = {
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      companyId: reqBodyCompanyId,
      jobId: reqBodyJobId,
      candidateEmail: reqBodyParsedCvCandidateEmail,
      refereeType: CorporateCandidateProfileDbRefereeTypeEnum.AGENCY,
      candidateParsedCvId: candidateParsedCvCreateData.id,
      agencyUserSubmissionId: agencyUserSubmissionCreateData.id,
      agencyUserId: agencyUserDetails.id,
      agencyRegisteredEmail: agencyUserDetails.email,
      phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails,
      userDetailId: candidateDetails?.id
    };

    candidateParsedCvCreateData.corporateCandidateProfileId = corporateCandidateProfileCreateData.id;

    /**
     * Prepare data to Create or Update Agency User Submission details in "CentralCandidateProfile" model
     */
    // Get existing candidate data from `CentralCandidateProfile` model
    const existingCentralCandidateProfile: DbCentralCandidateProfileDto | undefined =
      await centralCandidateProfileServiceObj.getCentralCandidateProfileById(
        reqBodyParsedCvCandidateEmail
      );

    let createOrUpdateCentralCandidateProfile: Promise<DbCentralCandidateProfileDto | undefined>;

    if(existingCentralCandidateProfile) {
      createOrUpdateCentralCandidateProfile = centralCandidateProfileServiceObj.updateCentralCandidateProfileById(
        reqBodyParsedCvCandidateEmail,
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
        id: reqBodyParsedCvCandidateEmail,
        createdAt: currentDate,
        updatedAt: currentDate,
        candidateEmail: reqBodyParsedCvCandidateEmail,
        phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails,
        refereeType: CentralCandidateProfileDbRefereeTypeEnum.AGENCY,
        userDetailId: candidateDetails?.id,
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

    const createAgencyUserSubmissionResult: [
      DbCandidateParsedCvDto | undefined, 
      DbAgencyUserSubmissionDto | undefined, 
      DbCorporateCandidateProfileDto | undefined, 
      DbCentralCandidateProfileDto | undefined, 
      DbAgencyJobAssignmentDto | undefined, 
      DbAgencyUserInviteDto | undefined
    ] = await Promise.all([
      candidateParsedCvServiceObj.createCandidateParsedCvWithEmbedding(
        candidateParsedCvCreateData
      ),
      this.createAgencyUserSubmission(agencyUserSubmissionCreateData),
      corporateCandidateProfileServiceObj.createCorporateCandidateProfile(corporateCandidateProfileCreateData),
      createOrUpdateCentralCandidateProfile,

      // Update agency job assignment collection with count of total candidate profiles/cvs which is uploaded by agency
      agencyJobAssignmentServiceObj.updateAgencyJobAssignmentById(
        jobAssignedToAgency.id,
        {
          updatedAt: currentDate,
          totalCandidatesUploaded: (jobAssignedToAgency.totalCandidatesUploaded ?? 0) + 1,
          agencyUserSubmissionIds: [
            ...(jobAssignedToAgency.agencyUserSubmissionIds ?? []),
            agencyUserSubmissionCreateData.id
          ]
        }
      ),

      // Update agency user invite collection with count of total candidate profiles/cvs which is submitted by agency
      agencyUserInviteServiceObj.updateAgencyUserInviteById(
        agencyUserInviteId,
        {
          updatedAt: currentDate,
          totalCandidatesSubmitted: (reqBodyAgencyInviteDetails.totalCandidatesSubmitted ?? 0) + 1,
          agencyUserSubmissionIds: [
            ...(reqBodyAgencyInviteDetails.agencyUserSubmissionIds ?? []),
            agencyUserSubmissionCreateData.id
          ]
        }
      )
    ]);

    // If any of the result is failed to create then throw error
    if (
      !createAgencyUserSubmissionResult[0] ||
      !createAgencyUserSubmissionResult[1] ||
      !createAgencyUserSubmissionResult[2] ||
      !createAgencyUserSubmissionResult[3] ||
      !createAgencyUserSubmissionResult[4] ||
      !createAgencyUserSubmissionResult[5]
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
      if(actionByCorporateUserId !== filterOptions.agencyJobAssignedByCorporateUserId) {
        global.logger.info(
          `To list user submissions for particular corporate user, agencyJobAssignedByCorporateUserId should match`,
          {
            methodName: this.performGetAllAgencyUserSubmissionActivities.name,
            filterOptions,
            actionByCorporateUserId,
          }
        );
        throw new BaseError(
          "You are not allowed to access this resource",
          HttpStatusCode.FORBIDDEN_403
        );
      }

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

  private async createJobApplAndUpdateAgencyUserSubmission(
    validatedRequestBody: AgencyUserSubmissionMoveToApplicantCreateApiDTO,
    cognitoUserGroups: string[],
    existingAgencyUserSubmissionDetails: DbAgencyUserSubmissionDto,
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    const {jobTitle, ...restValidatedRequestBody} = validatedRequestBody;
    const moveToApplicantDetails: DbUserJobApplicationDto =
      await userJobApplicationServiceObj.createJobApplicationMoveToApplicant(
      {
        ...restValidatedRequestBody,
        applicantEmail: existingAgencyUserSubmissionDetails.candidateEmail,
        candidateParsedCvId: existingAgencyUserSubmissionDetails.candidateParsedCvId,
        agencyUserId: existingAgencyUserSubmissionDetails.agencyUserId,
        matchingScoreDetails: existingAgencyUserSubmissionDetails?.matchingScoreDetails
      },
      cognitoUserGroups,
      actionByUserId,
      actionByCorporateUserId
    );
    if(moveToApplicantDetails.status !== JobApplicationStatus.ACCEPTED) {
      global.logger.error(`Failed to move to applicant`, { methodName: this.moveToApplicantAgencyUserSubmission.name, moveToApplicantDetails });
      throw new BaseError("Failed to move to applicant", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const updateAgencyUserSubmission: DbAgencyUserSubmissionDto | undefined = await this.updateAgencyUserSubmissionById(
      validatedRequestBody.agencyUserSubmissionId,
      {
        updatedAt: dateHelperObj.getISODate(),
        userJobApplicationId: moveToApplicantDetails.id,
        jobApplicationStatus: AgencyUserSubmissionDbJobApplicationStatusEnum.ACCEPTED,
        moveToApplicantByCorporateUserId: actionByCorporateUserId,
        moveToApplicantByUserId: actionByUserId,
        updatedByCorporateUserId: actionByCorporateUserId,
        updatedByUserId: actionByUserId
      }
    );

    if(!updateAgencyUserSubmission) {
      global.logger.error(`Failed to move to applicant, Failed to update Agency User Submission`, { 
        methodName: this.moveToApplicantAgencyUserSubmission.name, 
        validatedRequestBody,
        updateAgencyUserSubmission
      });
      throw new BaseError("Failed to move to applicant", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return updateAgencyUserSubmission;
  }

  async moveToApplicantAgencyUserSubmission(
    validatedRequestBody: AgencyUserSubmissionMoveToApplicantCreateApiDTO,
    cognitoUserGroups: string[],
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    const existingAgencyUserSubmissionDetails: DbAgencyUserSubmissionDto | undefined = await this.getAgencyUserSubmissionById(validatedRequestBody.agencyUserSubmissionId);
    if(!existingAgencyUserSubmissionDetails) {
      global.logger.error(`Failed to move to applicant, Agency User Submission not found`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    } 

    if(actionByCorporateUserId !== existingAgencyUserSubmissionDetails.agencyJobAssignedByCorporateUserId) {
      if(!actionByUserId || !cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)) {
        global.logger.error(`Only corporate or worko admin can move to applicant.`, { 
          methodName: this.moveToApplicantAgencyUserSubmission.name, 
          validatedRequestBody,
          existingAgencyUserSubmissionDetails,
          actionByUserId,
          cognitoUserGroups,
        });
        throw new BaseError("You are not allowed to access this resource.", HttpStatusCode.FORBIDDEN_403);
      }
    }

    if(existingAgencyUserSubmissionDetails.jobApplicationStatus) {
      global.logger.error(`Failed to move to applicant, Agency User Submission already moved to applicant`, { 
        methodName: this.moveToApplicantAgencyUserSubmission.name, 
        validatedRequestBody,
        existingAgencyUserSubmissionDetails
      });
      throw new BaseError("Candidate already moved to applicant.", HttpStatusCode.CONFLICT_409);
    }

    const candidateParsedCvDetails: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(
      existingAgencyUserSubmissionDetails.candidateParsedCvId
    );
    if(!candidateParsedCvDetails) {
      global.logger.error(`Failed to move to applicant, Candidate Parsed Cv not found`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const {
      name: candidateName,
      phoneNumberDetails: candidatePhoneNumberDetails,
      email: candidateEmail
    } = candidateParsedCvDetails;

    const workoUserPoolId: string | undefined = process.env.APP_AWS_WORKO_COGNITO_USER_POOL_ID;
    if(!workoUserPoolId) {
      global.logger.error(`Failed to move to applicant, Worko User Pool Id not found`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const applicantRegisteredDetails: QueryResponse<DbUserDetailDto> = await UserDetailService.get(
      candidateEmail
    );
    if(applicantRegisteredDetails.count) {
      return this.createJobApplAndUpdateAgencyUserSubmission(validatedRequestBody, cognitoUserGroups, existingAgencyUserSubmissionDetails, actionByUserId, actionByCorporateUserId);
    }

    const {
      number: candidatePhoneNumber,
      countryCode: candidatePhoneNumberCountryCode
    } = candidatePhoneNumberDetails;
    const candidateFullPhoneNumber: string = `+${candidatePhoneNumberCountryCode}${candidatePhoneNumber}`;
    const temporaryPassword: string = `Temp${UlidService.getUlidId().toLowerCase()}!`; // temporary password with lowercase

    const userCreateCognito: AdminCreateUserCommandOutput = await awsClientCognitoIdentityProviderLibrary.createUser(
      workoUserPoolId,
      existingAgencyUserSubmissionDetails.candidateEmail,
      temporaryPassword,
      [
        { Name: "name", Value: candidateName },
        { Name: "phone_number", Value: `+${candidatePhoneNumberCountryCode}${candidatePhoneNumber}` }
      ],
      "SUPPRESS"
    );
    if(!userCreateCognito.User?.Username) {
      global.logger.error(`Failed to move to applicant, Failed to create user in cognito`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedRequestBody });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    };

    const createUserDetailDto: UserDetailCreateDto = {
      id: userCreateCognito.User.Username,
      userId: userCreateCognito.User.Username,
      name: candidateName,
      email: existingAgencyUserSubmissionDetails.candidateEmail,
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

    const userDetailAndJobAppl: [DbUserDetailDto, DbAgencyUserSubmissionDto,boolean, boolean] = await Promise.all([
      UserDetailService.createUserDetail(createUserDetailDto),
      this.createJobApplAndUpdateAgencyUserSubmission(validatedRequestBody, cognitoUserGroups, existingAgencyUserSubmissionDetails, actionByUserId, actionByCorporateUserId),
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
      )
    ]);

    if(!userDetailAndJobAppl[0] || !userDetailAndJobAppl[1] || !userDetailAndJobAppl[2] || !userDetailAndJobAppl[3]) {
      global.logger.error(`Failed to move to applicant, Failed to create user detail OR update agency user submission`, { methodName: this.moveToApplicantAgencyUserSubmission.name, userDetailAndJobAppl });
      throw new BaseError("Failed to move to applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return userDetailAndJobAppl[1];
  }

  async createJobApplSendForEvalAndUpdateAgencyUserSubmission(
    validatedReqBody: AgencyUserSubmissionSendForEvaluationCreateApiDTO,
    cognitoUserGroups: string[],
    existingAgencyUserSubmissionDetails: DbAgencyUserSubmissionDto,
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    const {jobTitle, ...restReqBody} = validatedReqBody;
    const sendForEvaluationDetails: DbUserJobApplicationDto =
      await userJobApplicationServiceObj.createJobApplicationSendForEvaluation(
        {
          ...restReqBody,
          candidateParsedCvId: existingAgencyUserSubmissionDetails.candidateParsedCvId,
          agencyUserId: existingAgencyUserSubmissionDetails.agencyUserId,
          applicantEmail: existingAgencyUserSubmissionDetails.candidateEmail,
          matchingScoreDetails: existingAgencyUserSubmissionDetails?.matchingScoreDetails
        },
        cognitoUserGroups,
        actionByUserId,
        actionByCorporateUserId
      );
    if(sendForEvaluationDetails.status !== JobApplicationStatus.UNDER_EVALUATION) {
      global.logger.error(`Failed to send for evaluation`, { methodName: this.moveToApplicantAgencyUserSubmission.name, sendForEvaluationDetails });
      throw new BaseError("Failed to send for evaluation", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const updateAgencyUserSubmissionSendForEvaluation: DbAgencyUserSubmissionDto | undefined = await this.updateAgencyUserSubmissionById(
      validatedReqBody.agencyUserSubmissionId,
      {
        updatedAt: dateHelperObj.getISODate(),
        userJobApplicationId: sendForEvaluationDetails.id,
        jobApplicationStatus: AgencyUserSubmissionDbJobApplicationStatusEnum.UNDER_EVALUATION,
        sendForEvaluationByCorporateUserId: actionByCorporateUserId,
        sendForEvaluationByUserId: actionByUserId,
        updatedByCorporateUserId: actionByCorporateUserId,
        updatedByUserId: actionByUserId
      }
    );

    if(!updateAgencyUserSubmissionSendForEvaluation) {
      global.logger.error(`Failed to send for evaluation, Failed to update Agency User Submission`, { 
        methodName: this.moveToApplicantAgencyUserSubmission.name, 
        validatedReqBody,
        updateAgencyUserSubmissionSendForEvaluation
      });
      throw new BaseError("Failed to send for evaluation", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return updateAgencyUserSubmissionSendForEvaluation;
  }

  async sendForEvaluationAgencyUserSubmission(
    validatedReqBody: AgencyUserSubmissionSendForEvaluationCreateApiDTO,
    cognitoUserGroups: string[],
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    const existingAgencyUserSubmissionDetails: DbAgencyUserSubmissionDto | undefined = await this.getAgencyUserSubmissionById(validatedReqBody.agencyUserSubmissionId);
    if(!existingAgencyUserSubmissionDetails) {
      global.logger.error(`Failed to send for evaluation, Agency User Submission not found`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedReqBody });
      throw new BaseError("Failed to send for evaluation.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    } 

    if(actionByCorporateUserId !== existingAgencyUserSubmissionDetails.agencyJobAssignedByCorporateUserId) {
      if(!actionByUserId || !cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)) {
        global.logger.error(`Only corporate or worko admin can send for evaluation.`, { 
          methodName: this.moveToApplicantAgencyUserSubmission.name, 
          validatedReqBody,
          existingAgencyUserSubmissionDetails,
          actionByUserId,
          cognitoUserGroups,
        });
        throw new BaseError("You are not allowed to access this resource.", HttpStatusCode.FORBIDDEN_403);
      }
    }

    if(existingAgencyUserSubmissionDetails.jobApplicationStatus) {
      global.logger.error(`Failed to send for evaluation, Job Application status already exists.`, { 
        methodName: this.moveToApplicantAgencyUserSubmission.name, 
        validatedReqBody,
        existingAgencyUserSubmissionDetails
      });
      if(existingAgencyUserSubmissionDetails.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.UNDER_EVALUATION) {
        throw new BaseError("Candidate already sent for evaluation.", HttpStatusCode.CONFLICT_409);
      } else if(existingAgencyUserSubmissionDetails.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.REJECTED) {
        throw new BaseError("Candidate already rejected.", HttpStatusCode.CONFLICT_409);
      } else {
        throw new BaseError("Candidate already moved to applicant.", HttpStatusCode.CONFLICT_409);
      }
    }

    const candidateParsedCvDetails: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(
      existingAgencyUserSubmissionDetails.candidateParsedCvId
    );
    if(!candidateParsedCvDetails) {
      global.logger.error(`Failed to send for evaluation, Candidate Parsed Cv not found`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedReqBody });
      throw new BaseError("Failed to send for evaluation.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const {
      name: candidateName,
      phoneNumberDetails: candidatePhoneNumberDetails,
      email: candidateEmail
    } = candidateParsedCvDetails;

    const workoUserPoolId: string | undefined = process.env.APP_AWS_WORKO_COGNITO_USER_POOL_ID;
    if(!workoUserPoolId) {
      global.logger.error(`Failed to send for evaluation, Worko User Pool Id not found`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedReqBody });
      throw new BaseError("Failed to send for evaluation.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const applicantRegisteredDetails: QueryResponse<DbUserDetailDto> = await UserDetailService.get(
      candidateEmail
    );
    if(applicantRegisteredDetails.count) {
      const candidateDetails: DbUserDetailDto = applicantRegisteredDetails[0];
      if(candidateDetails.CV) {
        return this.createJobApplSendForEvalAndUpdateAgencyUserSubmission(validatedReqBody, cognitoUserGroups, existingAgencyUserSubmissionDetails, actionByUserId, actionByCorporateUserId);
      }
    }

    const {
      number: candidatePhoneNumber,
      countryCode: candidatePhoneNumberCountryCode
    } = candidatePhoneNumberDetails;
    const candidateFullPhoneNumber: string = `+${candidatePhoneNumberCountryCode}${candidatePhoneNumber}`;
    const temporaryPassword = `Temp${UlidService.getUlidId().toLowerCase()}!`;// temporary password with lowercase

    const userCreateCognito: AdminCreateUserCommandOutput = await awsClientCognitoIdentityProviderLibrary.createUser(
      workoUserPoolId,
      existingAgencyUserSubmissionDetails.candidateEmail,
      temporaryPassword,
      [
        { Name: "name", Value: candidateName },
        { Name: "phone_number", Value: `+${candidatePhoneNumberCountryCode}${candidatePhoneNumber}` }
      ],
      "SUPPRESS"
    );
    if(!userCreateCognito.User?.Username) {
      global.logger.error(`Failed to send for evaluation, Failed to create user in cognito`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedReqBody });
      throw new BaseError("Failed to send for evaluation.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    };

    const createUserDetailDto: UserDetailCreateDto = {
      id: userCreateCognito.User.Username,
      userId: userCreateCognito.User.Username,
      name: candidateName,
      email: existingAgencyUserSubmissionDetails.candidateEmail,
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

      acceptedTermsAndConditions: false
    };

    const userDetailAndJobAppl: [DbUserDetailDto, DbAgencyUserSubmissionDto, boolean, boolean] = await Promise.all([
      UserDetailService.createUserDetail(createUserDetailDto),
      this.createJobApplSendForEvalAndUpdateAgencyUserSubmission(validatedReqBody, cognitoUserGroups, existingAgencyUserSubmissionDetails, actionByUserId, actionByCorporateUserId),
      UserDetailService.sendEmailForCandAcctSignupReminder(
        candidateEmail,
        validatedReqBody.jobTitle,
        validatedReqBody.companyName,
        candidateName,
        temporaryPassword
      ),
      UserDetailService.scheduleCandChangePassSignupReminder(
        {
          candidateEmail,
          candidateName,
          jobTitle: validatedReqBody.jobTitle,
          companyName: validatedReqBody.companyName,
          temporaryPassword,
          candidateCognitoUserId: userCreateCognito.User.Username,
          reminderSendCount: 0
        }
      )
    ]);

    if(!userDetailAndJobAppl[0] || !userDetailAndJobAppl[1]) {
      global.logger.error(`Failed to send for evaluation, Failed to create user detail OR update agency user submission`, { methodName: this.moveToApplicantAgencyUserSubmission.name, userDetailAndJobAppl });
      throw new BaseError("Failed to send for evaluation.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return userDetailAndJobAppl[1];
  }

  async rejectApplicantAgencyUserSubmission(
    validatedReqBody: AgencyUserSubmissionRejectApplicantCreateApiDTO,
    cognitoUserGroups: string[],
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    const existingAgencyUserSubmissionDetails: DbAgencyUserSubmissionDto | undefined = await this.getAgencyUserSubmissionById(validatedReqBody.agencyUserSubmissionId);
    if(!existingAgencyUserSubmissionDetails) {
      global.logger.error(`Failed to reject applicant, Agency User Submission not found`, { methodName: this.moveToApplicantAgencyUserSubmission.name, validatedReqBody });
      throw new BaseError("Failed to reject applicant.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    } 

    if(actionByCorporateUserId !== existingAgencyUserSubmissionDetails.agencyJobAssignedByCorporateUserId) {
      if(!actionByUserId || !cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)) {
        global.logger.error(`Only corporate or worko admin can reject applicant.`, { 
          methodName: this.moveToApplicantAgencyUserSubmission.name, 
          validatedReqBody,
          existingAgencyUserSubmissionDetails,
          actionByUserId,
          cognitoUserGroups,
        });
        throw new BaseError("You are not allowed to access this resource.", HttpStatusCode.FORBIDDEN_403);
      }
    }

    if(existingAgencyUserSubmissionDetails.jobApplicationStatus) {
      global.logger.error(`Failed to reject applicant, Agency User Submission already moved to applicant`, { 
        methodName: this.moveToApplicantAgencyUserSubmission.name, 
        validatedReqBody,
        existingAgencyUserSubmissionDetails
      });
      if(existingAgencyUserSubmissionDetails.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.REJECTED) {
        throw new BaseError("Candidate submission already rejected, so you can't reject again.", HttpStatusCode.CONFLICT_409);
      }
      throw new BaseError("Candidate already moved to applicant, so you can't reject it.", HttpStatusCode.CONFLICT_409);
    }

    const updateAgencyUserSubmission: DbAgencyUserSubmissionDto | undefined = await this.updateAgencyUserSubmissionById(
      validatedReqBody.agencyUserSubmissionId,
      {
        updatedAt: dateHelperObj.getISODate(),
        jobApplicationStatus: AgencyUserSubmissionDbJobApplicationStatusEnum.REJECTED,
        rejectApplicantDetails: {
          reason: validatedReqBody.rejectApplicantReason,
          detailedReason: validatedReqBody.rejectApplicantDetailedReason,
          actionByCorporateUserId,
          actionByUserId,
        },
        updatedByCorporateUserId: actionByCorporateUserId,
        updatedByUserId: actionByUserId
      }
    );

    if(!updateAgencyUserSubmission) {
      global.logger.error(`Failed to reject applicant, Failed to update Agency User Submission`, { 
        methodName: this.moveToApplicantAgencyUserSubmission.name, 
        validatedReqBody,
        updateAgencyUserSubmission
      });
      throw new BaseError("Failed to reject applicant", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    return updateAgencyUserSubmission;
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

  async getAgencyUserSubmissionById(id: string): Promise<DbAgencyUserSubmissionDto | undefined> {
    return agencyUserSubmissionDaoObj.getAgencyUserSubmissionById(id);
  }

  async updateAgencyUserSubmissionById(
    id: string,
    updateData: Partial<DbAgencyUserSubmissionDto>
  ): Promise<DbAgencyUserSubmissionDto | undefined> {
    return agencyUserSubmissionDaoObj.updateAgencyUserSubmissionById(
      id,
      updateData
    );
  }

  async updateBulkAgencyUserSubmissionByIds(ids: string[], updateData: Partial<DbAgencyUserSubmissionDto>): Promise<boolean> {
    return agencyUserSubmissionDaoObj.updateBulkAgencyUserSubmissionByIds(ids, updateData);
  }

  async findMatchingScoreAgencyUserSubmission(validatedReqBody: AgencyUserSubmissionFindMatchingScoreApiDto): Promise<boolean> {
    const {
      actionByUserId,
      actionByCorporateUserId,
    } = getActionByUserId();
    const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

    const existingAgencyUserSubmission: DbAgencyUserSubmissionDto | undefined =
      await this.getAgencyUserSubmissionById(validatedReqBody.agencyUserSubmissionId);
    if(!existingAgencyUserSubmission) {
      global.logger.error(`Agency user submission not found.`, {
        methodName: this.findMatchingScoreAgencyUserSubmission.name,
        validatedReqBody,
        existingAgencyUserSubmission
      });
      throw new BaseError("Failed to find matching score.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    if(existingAgencyUserSubmission.agencyJobAssignedByCorporateUserId !== actionByCorporateUserId) {
      if(!actionByUserId || !cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)) {
        global.logger.error(`Only corporate or worko admin can find matching score.`, {
          methodName: this.findMatchingScoreAgencyUserSubmission.name,
          validatedReqBody,
          existingAgencyUserSubmission,
          actionByUserId,
          cognitoUserGroups,
        });
        throw new BaseError("You are not allowed to access this resource.", HttpStatusCode.FORBIDDEN_403);
      }
    }

    if(existingAgencyUserSubmission.jobApplicationStatus) {
      global.logger.error(`Failed to find matching score, Agency User Submission already moved to applicant`, { 
        methodName: this.findMatchingScoreAgencyUserSubmission.name, 
        validatedReqBody,
        existingAgencyUserSubmission
      });
      if(existingAgencyUserSubmission.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.REJECTED) {
        throw new BaseError("Candidate Submission already rejected, so you cannot find matching score.", HttpStatusCode.CONFLICT_409);
      }
      throw new BaseError("Candidate already moved to applicant, so you cannot find matching score.", HttpStatusCode.CONFLICT_409);
    }

    if(existingAgencyUserSubmission.matchingScoreDetails) {
      global.logger.error(`Matching score already calculated.`, {
        methodName: this.findMatchingScoreAgencyUserSubmission.name,
        validatedReqBody,
        agencyUserSubmissionId: validatedReqBody.agencyUserSubmissionId,
        existingAgencyUserSubmissionMatchingScoreDetails: existingAgencyUserSubmission.matchingScoreDetails,
      });
      throw new BaseError("Matching score already calculated.", HttpStatusCode.CONFLICT_409);
    }

    const existingCandidateParsedCv: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(existingAgencyUserSubmission.candidateParsedCvId);
    if(!existingCandidateParsedCv) {
      global.logger.error(`Candidate parsed cv not found.`, {
        methodName: this.findMatchingScoreAgencyUserSubmission.name,
        validatedReqBody,
        existingCandidateParsedCv
      });
      throw new BaseError("Failed to find matching score.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const {
      cvAwsS3BucketName,
      cvAwsS3FilePath,
      cvAwsS3FileName,
      jobId
    } = existingCandidateParsedCv;

    if(!jobId) {
      global.logger.error(`Job id not found in candidate parsed cv to find jd-resume matching score.`, {
        methodName: this.findMatchingScoreAgencyUserSubmission.name,
        validatedReqBody,
        jobId
      });
      throw new BaseError("Failed to find matching score.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    }

    const invokedMatchingScoreDetails: APIGatewayProxyResult = await InvokeLambdaService.triggerSourceTypeJdResumeMatchingScore(
      {
        agencyUserSubmissionId: validatedReqBody.agencyUserSubmissionId,
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
        methodName: this.findMatchingScoreAgencyUserSubmission.name,
        invokedMatchingScoreDetails,
      });
      throw new BaseError("Failed to find matching score", invokedMatchingScoreDetails.statusCode);
    }

    if(invokedMatchingScoreDetails.statusCode === HttpStatusCode.ACCEPTED_202) {
      global.logger.info(`Matching score processing started`, {
        methodName: this.findMatchingScoreAgencyUserSubmission.name,
        invokedMatchingScoreDetails,
      });

      return true;
    } else {
      return false;
    }
  }

  async bulkFindMatchingScoreAgencyUserSubmission(data: AgencyUserSubmissionBulkFindMatchingScoreApiDto): Promise<boolean> {
    global.logger.info("Bulk Find Matching Score Agency User Submission [service]", { 
      methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
      data
    });
    const {
      actionByUserId,
      actionByCorporateUserId,
    } = getActionByUserId();
    const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

    const {
      agencyUserSubmissionIds
    } = data;

    // Process each submission asynchronously
    await Promise.all(
      agencyUserSubmissionIds.map(async (agencyUserSubmissionId: string) => {
        try {
          const existingAgencyUserSubmission: DbAgencyUserSubmissionDto | undefined =
            await this.getAgencyUserSubmissionById(agencyUserSubmissionId);
          
          if (!existingAgencyUserSubmission) {
            global.logger.error(`Agency user submission not found for bulk processing, so we skipping this submission for find matching score.`, {
              methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
              agencyUserSubmissionId,
            });
            return;
          }

          if (existingAgencyUserSubmission.agencyJobAssignedByCorporateUserId !== actionByCorporateUserId) {
            if (!actionByUserId || !cognitoUserGroups.includes(APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN)) {
              global.logger.error(`Unauthorized access for bulk matching score.`, {
                methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
                agencyUserSubmissionId,
              });
              return;
            }
          }

          if (existingAgencyUserSubmission.jobApplicationStatus) {
            global.logger.info(`Candidate already moved to applicant, so we skipping this submission for find matching score.`, {
              methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
              agencyUserSubmissionId,
            });
            return;
          }

          if (existingAgencyUserSubmission.matchingScoreDetails) {
            global.logger.info(`Matching score already exists, skipping.`, {
              methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
              agencyUserSubmissionId,
            });
            return;
          }

          const existingCandidateParsedCv: DbCandidateParsedCvDto | undefined = 
            await candidateParsedCvServiceObj.getCandidateParsedCvById(existingAgencyUserSubmission.candidateParsedCvId);
          
          if (!existingCandidateParsedCv?.jobId) {
            global.logger.error(`Invalid candidate parsed cv for bulk processing.`, {
              methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
              agencyUserSubmissionId,
            });
            return;
          }

          const invokedMatchingScoreDetails: APIGatewayProxyResult = await InvokeLambdaService.triggerSourceTypeJdResumeMatchingScore(
            {
              agencyUserSubmissionId,
              actionByCorporateUserId,
              actionByUserId,
              jobId: existingCandidateParsedCv.jobId, 
              cvAwsS3BucketName: existingCandidateParsedCv.cvAwsS3BucketName,
              cvAwsS3FilePath: existingCandidateParsedCv.cvAwsS3FilePath,
              cvAwsS3FileName: existingCandidateParsedCv.cvAwsS3FileName,
              USER_PK: existingCandidateParsedCv.cvAwsS3ResourceType === CandidateParsedCvAwsS3ResourceTypeEnum.USER_RESUME ? `USR#EML#${existingCandidateParsedCv.email}`: undefined
            }
          );

          if (invokedMatchingScoreDetails.statusCode === HttpStatusCode.ACCEPTED_202) {
            global.logger.info(`Bulk matching score completed for submission.`, {
              methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
              agencyUserSubmissionId,
            });
          } else {
            global.logger.error(`Failed to calculate matching score for bulk processing.`, {
              methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
              agencyUserSubmissionId,
              statusCode: invokedMatchingScoreDetails.statusCode,
              invokedMatchingScoreDetails
            });
          }
        } catch (error) {
          global.logger.error(`Error in bulk matching score processing.`, {
            methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
            agencyUserSubmissionId,
            error,
          });
        }
      })
    );

    return true;
  }
}

const agencyUserSubmissionServiceObj = new AgencyUserSubmissionService();
export { agencyUserSubmissionServiceObj, AgencyUserSubmissionService };