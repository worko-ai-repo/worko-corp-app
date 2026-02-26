
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

import { APIGatewayProxyResult } from "aws-lambda";

// import luxon
import { DateTime } from "luxon";

// import google cloud firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// import configs
import APP_CONSTANTS from "../configs/constants.config";

// import daos
import { userJobApplicationDao } from "../daos/UserJobApplication.dao";
import userDetailDao from "../daos/UserDetail.dao";

// import dtos
import { InvokeLambdaJobApplicationValidationMatchingScoreDto, InvokeLambdMatchingScoreCalcualtionDto } from "../dtos/InvokeLambda.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse } from "../dtos/Common.dto";
import { ScheduleBlacklistedUserJobApplicationStatusUpdateToRejecteInputDto, ScheduleJobCreateDto } from "../dtos/ScheduleJob.dto";
import { UserJobApplicationMoveToApplicantCreateApiDTO, UserJobApplicationMoveToApplicantCreateDto, UserJobApplicationMoveToApplicantSubmitFormCreateApiDTO, UserJobApplicationSendForEvaluationCreateApiDTO } from "../dtos/UserJobApplication.dto";

// import enums
import { AdminRoleEnum, HiringEligibilityStatusEnum, MatchingScoreEntityEnum } from "../enums/Common.enum";
import { CorporateUserTypeEnum } from "../enums/CorporateUser.enum";
import { JobStatusEnum } from "../enums/Job.enum";
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";
import { CountGlobalDbEntityTypeEnum } from "../enums/CountGlobal.enum";
import { CountCompanyJobDbEntityTypeEnum } from "../enums/CountCompanyJob.enum";
import { CountUserDbEntityTypeEnum } from "../enums/CountUser.enum";
import { CountCompanyDbEntityTypeEnum } from "../enums/CountCompany.enum";
import { ScheduleJobStatus, ScheduleJobType } from "../enums/ScheduleJob.enum";
import { InvocationTypeEnum, InvokeLambdaHandlerEventTypeEnum } from "../enums/InvokeLambda.enum";

// import helpers
import { dateHelperObj } from "../helpers/date.helper";

// import types
import { JobApplicationUserType } from "../types/UserJobApplication.type";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

// import services
import { companyJobServiceObj } from "./CompanyJob.service";
import { countCompanyJobServiceObj } from "./CountCompanyJob.service";
import { countUserServiceObj } from "./CountUser.service";
import { countGlobalServiceObj } from "./CountGlobal.service";
import { countCompanyServiceObj } from "./CountCompany.service";
import { corporateCandidateProfileServiceObj } from "./CorporateCandidateProfile.service";
import { scheduleJobServiceObj } from "./ScheduleJob.service";
import InvokeLambdaService from "./InvokeLambda.service";

// import models
import { DbCompanyJobDto } from "../db/aws-dynamodb-models/CompanyJob.model";
import { DbUserJobApplicationDto } from "../db/aws-dynamodb-models/UserJobApplication.model";
import { DbCountUserDto } from "../db/aws-dynamodb-models/CountUser.model";
import { DbCountGlobalDto } from "../db/aws-dynamodb-models/CountGlobal.model";
import { DbCountCompanyDto } from "../db/aws-dynamodb-models/CountCompany.model";
import { DbCountCompanyJobDto } from "../db/aws-dynamodb-models/CountCompanyJob.model";
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbScheduleJobDto } from "../db/aws-dynamodb-models/ScheduleJob.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

/**
 * UserJobApplicationService
 * 
 * Service for handling user job application-related operations
 */
class UserJobApplicationService {
  async updateJobApplicationByIdAndPrimaryEmail(
    id: string,
    email: string,
    updateData: Partial<DbUserJobApplicationDto>
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info("Update job application [service]", {
      methodName: this.updateJobApplicationByIdAndPrimaryEmail.name,
      id,
      email
    });

    return userJobApplicationDao.updateJobApplicationByIdAndPrimaryEmail(id, email, updateData);
  }

  async scheduleBlacklistedUserJobApplicationStatusUpdate(
    userJobApplicationId: string,
    userEmail: string,
  ): Promise<boolean> {
    // Log
    global.logger.info(
      `Attempting to create delay for blacklisted user job application status update`,
      {
        methodName: this.scheduleBlacklistedUserJobApplicationStatusUpdate.name,
      }
    );

    // Calculate the schedule time based on the delay hours constant
    const delayHours: number = APP_CONSTANTS.BLACK_LISTED_USER_JOB_APPLICATION_UPDATE_AFTER_X_HOURS;

    // Prepare input details
    let scheduleBlacklistedUserJobApplicationStatusUpdateInput: ScheduleBlacklistedUserJobApplicationStatusUpdateToRejecteInputDto =
      {
        userJobApplicationId,
        userEmail,
      };

    // Prepare the payload for the scheduled job
    const scheduleJobPayload: ScheduleJobCreateDto = {
      type: ScheduleJobType.BLACK_LISTED_USER_JOB_APPLICATION_STATUS_UPDATE,
      scheduleTime: DateTime.now()
        .plus({ hours: delayHours })
        .toUTC()
        .toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      input: scheduleBlacklistedUserJobApplicationStatusUpdateInput,
      desc: `Scheduled job to update blacklisted user job application status after ${delayHours} hours`,
      status: ScheduleJobStatus.SCHEDULED,
    };
    global.logger.info(`scheduleJobPayload`, {
      scheduleJobPayload,
    });

    /**
     * @description
     *  1. In `worko-job-app` repository of `app-scheduler.ts` file check "BLACK_LISTED_USER_JOB_APPLICATION_STATUS_UPDATE" schedule type 
     *     after specified delay hours.
     */
    const schedulerLambdaArn: string = APP_CONSTANTS.AWS_EVENT_BRIDGE_SCHEDULER_ARNS.WORKO_JOB_APP_SCHEDULER_LAMBDA_ARN.strtr({
      "{serverlessFunctionName}": APP_CONSTANTS.SERVERLESS_FUNCTION_NAMES.WORKO_JOB_APP_SCHEDULER_HANDLER
    });

    // Create the scheduled job
    let scheduleJobCreated: DbScheduleJobDto =
      await scheduleJobServiceObj.createScheduleJob(scheduleJobPayload,schedulerLambdaArn);

    // Log the result of the scheduled job creation
    if (scheduleJobCreated) {
      global.logger.info(`Scheduled job for blacklisted user job application status update.`, {
        methodName: this.scheduleBlacklistedUserJobApplicationStatusUpdate.name,
      });

      // Prepare update job application data
      const updateData: Partial<DbUserJobApplicationDto> = {
        rejectionBlacklistedAwsScheduleId: scheduleJobCreated.id,
      }

      const updateJobApplication: DbUserJobApplicationDto = await this.updateJobApplicationByIdAndPrimaryEmail(
        userJobApplicationId,
        userEmail,
        updateData
      )

      return true;
    } else {
      global.logger.error(
        `Failed to create scheduled job for blacklisted user job application status update.`
      );
      return false;
    }
  }

  async createJobApplicationMoveToApplicantSubmitForm(
    reqBody: UserJobApplicationMoveToApplicantSubmitFormCreateApiDTO,
    candidateParsedCvDetails: DbCandidateParsedCvDto
  ) {
    const {
      applicantEmail: reqBodyApplicantEmail,
      jobId: reqBodyJobId,
      companyName: reqBodyCompanyName,
      candidateParsedCvId: reqBodyCandidateParsedCvId,
    } = reqBody;

    // Fetch job details based on job ID
    const jobDetails: DbCompanyJobDto = (
      await companyJobServiceObj.getJobById(reqBodyJobId)
    )[0];

    // Throw an error if job is not published
    if (jobDetails.status !== JobStatusEnum.PUBLISHED || jobDetails.isDeleted) {
      throw new BaseError(
        `The new job applications for this job are currently closed.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    // Check if the user has already applied for the job and throw error if already applied for the job
    let existingUserJobApplicationQueryResponse: QueryResponse<DbUserJobApplicationDto> =
      await userJobApplicationDao.getJobApplicationByjobId(
        reqBodyApplicantEmail,
        jobDetails.id
      );

    // Check if user has already applied for the job
    if (existingUserJobApplicationQueryResponse.count) {
      // Throw error if user has already applied for the job.
      global.logger.error(
        `The application for this job is already present.`,
        HttpStatusCode.CONFLICT_409
      );
      return false;
    }

    const currentDateAndTime: string = dateHelperObj.getISODate();

    const corporateCandidateProfileDetails: QuerySnapshot<DocumentData, DocumentData> = await corporateCandidateProfileServiceObj.getCorporateCandidateProfileByCompIdAndCandEmail(
      jobDetails.companyId,
      reqBodyApplicantEmail
    );
    const corporateCandProfileData: DbCorporateCandidateProfileDto | undefined = corporateCandidateProfileDetails.empty
      ? undefined
      : corporateCandidateProfileDetails.docs[0].data() as DbCorporateCandidateProfileDto;

    if(corporateCandProfileData) {
      if(
        corporateCandProfileData.hiringEligibilityStatus === HiringEligibilityStatusEnum.UNDER_COOLING_PERIOD
      ) {
        const endDate: string = corporateCandProfileData.underCoolingPeriod?.endDate ?? "";
        const endCoolingPeriod: string = dateHelperObj.formatISODateToDDMMYYYY(endDate);
        throw new BaseError(
          `You recently interviewed for ${reqBody.companyName.toTitleCase()} and got rejected. So please wait until ${endCoolingPeriod} to apply for any other role for ${reqBody.companyName.toTitleCase()}.`,
          HttpStatusCode.CONFLICT_409
        );
      }
    }

    // Prepare the data required to create a new job application
    const userJobApplicationDto: UserJobApplicationMoveToApplicantCreateDto = {
      jobId: reqBodyJobId,
      companyName: reqBodyCompanyName,
      companyId: jobDetails.companyId,
      status: JobApplicationStatus.APPLIED,
      statusTracker: [
        {
          oldStatus: JobApplicationStatus.APPLIED,
          newStatus: JobApplicationStatus.APPLIED,
          actionDate: currentDateAndTime,
        },
      ],
      candidateParsedCvId: reqBodyCandidateParsedCvId,
    };

    // Create a new job application
    const jobApplicationDetails: DbUserJobApplicationDto =
      await userJobApplicationDao.createJobApplicationMoveToApplicant(
        reqBodyApplicantEmail, // email id of the candidate applying for the job
        userJobApplicationDto // job application request body
      );
    if (!jobApplicationDetails || !jobApplicationDetails.id) {
      throw new BaseError(
        `Unable to move the candidate to applicants page.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const countUserJobApplicationQueryResponse: QueryResponse<DbCountUserDto> =
      await countUserServiceObj.getCountUserByRegisteredEmailAndEntityType(
        reqBodyApplicantEmail,
        CountUserDbEntityTypeEnum.JOB_APPLICATION
      );
    const countUserJobApplicationData: DbCountUserDto =
      countUserJobApplicationQueryResponse[0];

    const countGlobalCompanyJobQueryResponse: QueryResponse<DbCountGlobalDto> =
      await countGlobalServiceObj.getCountGlobalByEntityType(
        CountGlobalDbEntityTypeEnum.COMPANY_JOB
      );
    const countGlobalCompanyJobData: DbCountGlobalDto =
      countGlobalCompanyJobQueryResponse[0];

    const countGlobalCandidateQueryResponse: QueryResponse<DbCountGlobalDto> =
      await countGlobalServiceObj.getCountGlobalByEntityType(
        CountGlobalDbEntityTypeEnum.CANDIDATE
      );
    const countGlobalCandidateData: DbCountGlobalDto =
      countGlobalCandidateQueryResponse[0];

    const countCompanyJobQueryResponse: QueryResponse<DbCountCompanyJobDto> =
      await countCompanyJobServiceObj.getCountCompanyJobByCompanyIdJobIdAndEntityType(
        jobDetails.companyId,
        jobDetails.id,
        CountCompanyJobDbEntityTypeEnum.JOB_APPLICATION
      );
    const countCompanyJobData: DbCountCompanyJobDto =
      countCompanyJobQueryResponse[0];

    const countCompanyQueryResponse: QueryResponse<DbCountCompanyDto> =
      await countCompanyServiceObj.getCountCompanyByCompanyIdAndEntityType(
        jobDetails.companyId,
        CountCompanyDbEntityTypeEnum.JOB_APPLICATION
      );
    const countCompanyData: DbCountCompanyDto = countCompanyQueryResponse[0];

    // Prepare the job application SK for the job application to Pass to calculate matching score Lambda
    const jobApplicationSK: string =
      userJobApplicationDao.sortKeys.SK_JOB_APP_ID.strtr({
        "{id}": jobApplicationDetails.id,
      });
    const {
      cvAwsS3BucketName,
      cvAwsS3FilePath,
      cvAwsS3FileName,
      cvAwsS3ResourceType
    } = candidateParsedCvDetails;
    const jdResumeMatchInvokePayload: InvokeLambdMatchingScoreCalcualtionDto = {
      USER_PK: userDetailDao.partitianKey.strtr({
        "{primaryEmail}": reqBodyApplicantEmail,
      }),
      USER_DETAIL_SK: `ID#`,
      ENTITY_SK: jobApplicationSK,
      MATCHING_ENTITY: MatchingScoreEntityEnum.SOURCE_TYPE_JOB_APP,
      candidateParsedCvId: reqBodyCandidateParsedCvId,
      sourceTypeCvAwsS3Details: {
        resourceType: cvAwsS3ResourceType,
        bucketName: cvAwsS3BucketName,
        filePath: cvAwsS3FilePath,
        fileName: cvAwsS3FileName as string
      }
    }

    await Promise.all([
      countUserServiceObj.createOrUpdateCountUserForJobApplicationEntityType(
        reqBodyApplicantEmail,
        {
          userJobApplicationCounts: {
            ...countUserJobApplicationData?.userJobApplicationCounts,
            total: countUserJobApplicationData?.userJobApplicationCounts?.total
              ? countUserJobApplicationData.userJobApplicationCounts.total + 1
              : 1,
            applied: countUserJobApplicationData?.userJobApplicationCounts?.applied
              ? countUserJobApplicationData.userJobApplicationCounts.applied + 1
              : 1,
          },
        },
        !!countUserJobApplicationQueryResponse.count // If count user already exists in ddb then `true` else `false`
      ),
      countGlobalServiceObj.createOrUpdateCountGlobalForCompanyJobEntityType(
        {
          companyJobApplicationCounts: {
            ...countGlobalCompanyJobData?.companyJobApplicationCounts,
            total: countGlobalCompanyJobData?.companyJobApplicationCounts?.total
              ? countGlobalCompanyJobData.companyJobApplicationCounts.total + 1
              : 1,
            applied: countGlobalCompanyJobData?.companyJobApplicationCounts?.applied
              ? countGlobalCompanyJobData.companyJobApplicationCounts.applied + 1
              : 1,
          },
        },
        !!countGlobalCompanyJobQueryResponse.count
      ),
      countGlobalServiceObj.createOrUpdateCountGlobalForCandidateEntityType(
        {
          candidateJobApplicationCounts: {
            ...countGlobalCandidateData?.candidateJobApplicationCounts,
            total: countGlobalCandidateData?.candidateJobApplicationCounts
              ?.total
              ? countGlobalCandidateData.candidateJobApplicationCounts.total + 1
              : 1,
            applied: countGlobalCandidateData?.candidateJobApplicationCounts?.applied
              ? countGlobalCandidateData.candidateJobApplicationCounts.applied + 1
              : 1,
          },
        },
        !!countGlobalCompanyJobQueryResponse.count
      ),
      countCompanyJobServiceObj.createOrUpdateCountCompanyJobForJobApplicationEntityType(
        jobDetails.companyId,
        jobDetails.id,
        {
          allJobApplicationCounts: {
            ...countCompanyJobData?.allJobApplicationCounts,
            total: countCompanyJobData?.allJobApplicationCounts?.total
              ? countCompanyJobData.allJobApplicationCounts.total + 1
              : 1,
            applied: countCompanyJobData?.allJobApplicationCounts?.applied
              ? countCompanyJobData.allJobApplicationCounts.applied + 1
              : 1,
          },
        },
        !!countCompanyJobQueryResponse.count
      ),
      countCompanyServiceObj.createOrUpdateCountCompanyForJobApplicationEntityType(
        jobDetails.companyId,
        {
          allJobApplicationCounts: {
            ...countCompanyData?.allJobApplicationCounts,
            total: countCompanyData?.allJobApplicationCounts?.total
              ? countCompanyData.allJobApplicationCounts.total + 1
              : 1,
            applied: countCompanyData?.allJobApplicationCounts?.applied
              ? countCompanyData.allJobApplicationCounts.applied + 1
              : 1,
          },
        },
        !!countCompanyQueryResponse.count
      ),

      (corporateCandProfileData && corporateCandProfileData.hiringEligibilityStatus === HiringEligibilityStatusEnum.BLACK_LISTED) 
      ? this.scheduleBlacklistedUserJobApplicationStatusUpdate(
        jobApplicationDetails.id,
        reqBodyApplicantEmail,
      )
      : InvokeLambdaService.triggerMatchingScoreCalculation(
        jdResumeMatchInvokePayload
      ),
    ]);

    return true;
  }

  /**
   * @description
   *  1. Whenever worko-admin moves a candidate to applicant page then we will trigger ai lambda to
   *  perform matching score calculation and if score is more than specified threshold then we will display
   *  it to corporate recruiter
   *  2. This method is used to move the "agency submitted candidate" to applicant page by worko-admin
   *  3. This method is used when `corporate` or `worko-admin` move to applicant in `my database` or `ATLAS` page
   */
  async createJobApplicationMoveToApplicant(
    reqBody: UserJobApplicationMoveToApplicantCreateApiDTO,
    candidateParsedCvDetails: DbCandidateParsedCvDto,
    cognitoUserGroups: string[],
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    const {
      applicantEmail: reqBodyApplicantEmail,
      jobId: reqBodyJobId,
      companyName: reqBodyCompanyName,
      agencyUserSubmissionId: reqBodyAgencyUserSubmissionId,
      candidateParsedCvId: reqBodyCandidateParsedCvId,
      agencyUserId: reqBodyAgencyUserId,
    } = reqBody;

    // Fetch job details based on job ID
    const jobDetails: DbCompanyJobDto = (
      await companyJobServiceObj.getJobById(reqBodyJobId)
    )[0];

    // Throw an error if job is not published
    if (jobDetails.status !== JobStatusEnum.PUBLISHED || jobDetails.isDeleted) {
      throw new BaseError(
        `The new job applications for this job are currently closed.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    let corporateCandProfileData: DbCorporateCandidateProfileDto | undefined;
    let moveToApplicantByAdmin: boolean = false;
    let moveToApplicantByCorporate: boolean = false;
    let statusTrackerActionByUserId: string | undefined;
    let statusTrackerActionByUserType: JobApplicationUserType | undefined;
    if (actionByCorporateUserId) {
      statusTrackerActionByUserId = actionByCorporateUserId;
      if (cognitoUserGroups.includes(CorporateUserTypeEnum.CORPORATE_ADMIN)) {
        statusTrackerActionByUserType = CorporateUserTypeEnum.CORPORATE_ADMIN;
      } else {
        statusTrackerActionByUserType =
          CorporateUserTypeEnum.CORPORATE_RECRUITER;
      }
      moveToApplicantByCorporate = true;
    } else if (
      actionByUserId &&
      cognitoUserGroups.includes(
        APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN
      )
    ) {
      statusTrackerActionByUserId = actionByUserId;
      statusTrackerActionByUserType = AdminRoleEnum.ADMIN;
      moveToApplicantByAdmin = true;
      const corporateCandidateProfileDetails: QuerySnapshot<DocumentData, DocumentData> = await corporateCandidateProfileServiceObj.getCorporateCandidateProfileByCompIdAndCandEmail(
        jobDetails.companyId,
        reqBodyApplicantEmail
      );
      corporateCandProfileData = corporateCandidateProfileDetails.empty
        ? undefined
        : corporateCandidateProfileDetails.docs[0].data() as DbCorporateCandidateProfileDto;

      if(corporateCandProfileData) {
        if(
          corporateCandProfileData.hiringEligibilityStatus === HiringEligibilityStatusEnum.UNDER_COOLING_PERIOD
        ) {
          const endDate: string = corporateCandProfileData.underCoolingPeriod?.endDate ?? "";
          const endCoolingPeriod: string = dateHelperObj.formatISODateToDDMMYYYY(endDate);
          throw new BaseError(
            `This candidate is recently interviewed for ${reqBody.companyName.toTitleCase()} and got rejected. So please wait until ${endCoolingPeriod} to move to any other role for ${reqBody.companyName.toTitleCase()}.`,
            HttpStatusCode.CONFLICT_409
          );
        }
      }
    } else {
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }

    // Check if the user has already applied for the job and throw error if already applied for the job
    let existingUserJobApplicationQueryResponse: QueryResponse<DbUserJobApplicationDto> =
      await userJobApplicationDao.getJobApplicationByjobId(
        reqBodyApplicantEmail,
        jobDetails.id
      );

    // Check if user has already applied for the job
    if (existingUserJobApplicationQueryResponse.count) {
      // Throw error if user has already applied for the job.
      throw new BaseError(
        `The application for this job is already present.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    const currentDateAndTime: string = dateHelperObj.getISODate();
    const jobApplicationStatus: JobApplicationStatus = moveToApplicantByAdmin ? JobApplicationStatus.APPLIED : JobApplicationStatus.ACCEPTED;
    // Prepare the data required to create a new job application
    const userJobApplicationDto: UserJobApplicationMoveToApplicantCreateDto = {
      jobId: reqBodyJobId,
      companyName: reqBodyCompanyName,
      companyId: jobDetails.companyId,
      status: jobApplicationStatus,
      statusTracker: [
        {
          oldStatus: jobApplicationStatus,
          newStatus: jobApplicationStatus,
          actionDate: currentDateAndTime,
          userId: statusTrackerActionByUserId,
          userType: statusTrackerActionByUserType,
        },
      ],
      agencyUserSubmissionId: reqBodyAgencyUserSubmissionId,
      candidateParsedCvId: reqBodyCandidateParsedCvId,
      agencyUserId: reqBodyAgencyUserId,
      ...reqBody?.matchingScoreDetails,
    };

    const displayToCorporate: true | undefined = moveToApplicantByCorporate ? true : undefined; 

    // Create a new job application
    const jobApplicationDetails: DbUserJobApplicationDto =
      await userJobApplicationDao.createJobApplicationMoveToApplicant(
        reqBodyApplicantEmail, // email id of the candidate applying for the job
        userJobApplicationDto, // job application request body
        displayToCorporate
      );
    if (!jobApplicationDetails || !jobApplicationDetails.id) {
      throw new BaseError(
        `Unable to move the candidate to applicants page.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const countUserJobApplicationQueryResponse: QueryResponse<DbCountUserDto> =
      await countUserServiceObj.getCountUserByRegisteredEmailAndEntityType(
        reqBodyApplicantEmail,
        CountUserDbEntityTypeEnum.JOB_APPLICATION
      );
    const countUserJobApplicationData: DbCountUserDto =
      countUserJobApplicationQueryResponse[0];

    const countGlobalCompanyJobQueryResponse: QueryResponse<DbCountGlobalDto> =
      await countGlobalServiceObj.getCountGlobalByEntityType(
        CountGlobalDbEntityTypeEnum.COMPANY_JOB
      );
    const countGlobalCompanyJobData: DbCountGlobalDto =
      countGlobalCompanyJobQueryResponse[0];

    const countGlobalCandidateQueryResponse: QueryResponse<DbCountGlobalDto> =
      await countGlobalServiceObj.getCountGlobalByEntityType(
        CountGlobalDbEntityTypeEnum.CANDIDATE
      );
    const countGlobalCandidateData: DbCountGlobalDto =
      countGlobalCandidateQueryResponse[0];

    const countCompanyJobQueryResponse: QueryResponse<DbCountCompanyJobDto> =
      await countCompanyJobServiceObj.getCountCompanyJobByCompanyIdJobIdAndEntityType(
        jobDetails.companyId,
        jobDetails.id,
        CountCompanyJobDbEntityTypeEnum.JOB_APPLICATION
      );
    const countCompanyJobData: DbCountCompanyJobDto =
      countCompanyJobQueryResponse[0];

    const countCompanyQueryResponse: QueryResponse<DbCountCompanyDto> =
      await countCompanyServiceObj.getCountCompanyByCompanyIdAndEntityType(
        jobDetails.companyId,
        CountCompanyDbEntityTypeEnum.JOB_APPLICATION
      );
    const countCompanyData: DbCountCompanyDto = countCompanyQueryResponse[0];

    const jobApplicationPromises: (
      Promise<DbCountUserDto> | 
      Promise<DbCountGlobalDto> | 
      Promise<DbCountCompanyJobDto> | 
      Promise<DbCountCompanyDto> | Promise<boolean> | Promise<APIGatewayProxyResult>
    )[] = [
      countUserServiceObj.createOrUpdateCountUserForJobApplicationEntityType(
        reqBodyApplicantEmail,
        {
          userJobApplicationCounts: {
            ...countUserJobApplicationData?.userJobApplicationCounts,
            total: countUserJobApplicationData?.userJobApplicationCounts?.total
              ? countUserJobApplicationData.userJobApplicationCounts.total + 1
              : 1,
            applied: moveToApplicantByAdmin ? (
              countUserJobApplicationData?.userJobApplicationCounts?.applied
                ? countUserJobApplicationData.userJobApplicationCounts.applied + 1
                : 1
            ) : undefined
          },
        },
        !!countUserJobApplicationQueryResponse.count // If count user already exists in ddb then `true` else `false`
      ),
      countGlobalServiceObj.createOrUpdateCountGlobalForCompanyJobEntityType(
        {
          companyJobApplicationCounts: {
            ...countGlobalCompanyJobData?.companyJobApplicationCounts,
            total: countGlobalCompanyJobData?.companyJobApplicationCounts?.total
              ? countGlobalCompanyJobData.companyJobApplicationCounts.total + 1
              : 1,
            applied: moveToApplicantByAdmin ? (
              countGlobalCompanyJobData?.companyJobApplicationCounts?.applied
                ? countGlobalCompanyJobData.companyJobApplicationCounts.applied + 1
                : 1
            ) : undefined
          },
        },
        !!countGlobalCompanyJobQueryResponse.count
      ),
      countGlobalServiceObj.createOrUpdateCountGlobalForCandidateEntityType(
        {
          candidateJobApplicationCounts: {
            ...countGlobalCandidateData?.candidateJobApplicationCounts,
            total: countGlobalCandidateData?.candidateJobApplicationCounts
              ?.total
              ? countGlobalCandidateData.candidateJobApplicationCounts.total + 1
              : 1,
            applied: moveToApplicantByAdmin ? (
              countGlobalCandidateData?.candidateJobApplicationCounts?.applied
                ? countGlobalCandidateData.candidateJobApplicationCounts.applied + 1
                : 1
            ) : undefined
          },
        },
        !!countGlobalCompanyJobQueryResponse.count
      ),
      countCompanyJobServiceObj.createOrUpdateCountCompanyJobForJobApplicationEntityType(
        jobDetails.companyId,
        jobDetails.id,
        {
          allJobApplicationCounts: {
            ...countCompanyJobData?.allJobApplicationCounts,
            total: countCompanyJobData?.allJobApplicationCounts?.total
              ? countCompanyJobData.allJobApplicationCounts.total + 1
              : 1,
            applied: moveToApplicantByAdmin ? (
              countCompanyJobData?.allJobApplicationCounts?.applied
                ? countCompanyJobData.allJobApplicationCounts.applied + 1
                : 1
            ) : undefined
          },
        },
        !!countCompanyJobQueryResponse.count
      ),
      countCompanyServiceObj.createOrUpdateCountCompanyForJobApplicationEntityType(
        jobDetails.companyId,
        {
          allJobApplicationCounts: {
            ...countCompanyData?.allJobApplicationCounts,
            total: countCompanyData?.allJobApplicationCounts?.total
              ? countCompanyData.allJobApplicationCounts.total + 1
              : 1,
            applied: moveToApplicantByAdmin ? (
              countCompanyData?.allJobApplicationCounts?.applied
                ? countCompanyData.allJobApplicationCounts.applied + 1
                : 1
            ) : undefined
          },
        },
        !!countCompanyQueryResponse.count
      ),
    ];

    if(moveToApplicantByAdmin && reqBody?.matchingScoreDetails && reqBody?.matchingScoreDetails?.matchingScore) {
      // invoke valdidate matching score worko-job-app repo lambda
      const invokeDataPayload: InvokeLambdaJobApplicationValidationMatchingScoreDto = {
        userEmail: reqBodyApplicantEmail,
        jobApplicationRequestId: jobApplicationDetails.id
      }
      const invokePromise = InvokeLambdaService.triggerWorkoJobAppInvokeLambdaTrigger(
        InvocationTypeEnum.EventType,
        {
          eventType: InvokeLambdaHandlerEventTypeEnum.JOB_APPLICATION_VALIDATE_MATCHING_SCORE,
          data: invokeDataPayload
        }
      )
      jobApplicationPromises.push(invokePromise);
    } else if(moveToApplicantByAdmin && (!reqBody?.matchingScoreDetails || !reqBody?.matchingScoreDetails?.matchingScore)) {
      const jobApplicationSK: string =
        userJobApplicationDao.sortKeys.SK_JOB_APP_ID.strtr({
          "{id}": jobApplicationDetails.id,
        });
      const {
        cvAwsS3BucketName,
        cvAwsS3FilePath,
        cvAwsS3FileName,
        cvAwsS3ResourceType
      } = candidateParsedCvDetails;
      const jdResumeMatchInvokePayload: InvokeLambdMatchingScoreCalcualtionDto = {
        USER_PK: userDetailDao.partitianKey.strtr({
          "{primaryEmail}": reqBodyApplicantEmail,
        }),
        USER_DETAIL_SK: `ID#`,
        ENTITY_SK: jobApplicationSK,
        MATCHING_ENTITY: MatchingScoreEntityEnum.SOURCE_TYPE_JOB_APP,
        candidateParsedCvId: candidateParsedCvDetails.id,
        sourceTypeCvAwsS3Details: {
          resourceType: cvAwsS3ResourceType,
          bucketName: cvAwsS3BucketName,
          filePath: cvAwsS3FilePath,
          fileName: cvAwsS3FileName as string
        }
      }
 
      const triggerAiMatchScoreCal = (corporateCandProfileData && corporateCandProfileData.hiringEligibilityStatus === HiringEligibilityStatusEnum.BLACK_LISTED) 
      ? this.scheduleBlacklistedUserJobApplicationStatusUpdate(
        jobApplicationDetails.id,
        reqBodyApplicantEmail,
      )
      : InvokeLambdaService.triggerMatchingScoreCalculation(
        jdResumeMatchInvokePayload
      )
      jobApplicationPromises.push(triggerAiMatchScoreCal);
    } 

    await Promise.all(jobApplicationPromises);

    return jobApplicationDetails;
  }

  async createJobApplicationSendForEvaluation(
    reqBody: UserJobApplicationSendForEvaluationCreateApiDTO,
    cognitoUserGroups: string[],
    actionByUserId?: string,
    actionByCorporateUserId?: string
  ) {
    const {
      applicantEmail: reqBodyApplicantEmail,
      jobId: reqBodyJobId,
      companyName: reqBodyCompanyName,
      agencyUserSubmissionId: reqBodyAgencyUserSubmissionId,
    } = reqBody;

    let statusTrackerActionByUserId: string | undefined;
    let statusTrackerActionByUserType: JobApplicationUserType | undefined;
    if (actionByCorporateUserId) {
      statusTrackerActionByUserId = actionByCorporateUserId;
      if (cognitoUserGroups.includes(CorporateUserTypeEnum.CORPORATE_ADMIN)) {
        statusTrackerActionByUserType = CorporateUserTypeEnum.CORPORATE_ADMIN;
      } else {
        statusTrackerActionByUserType =
          CorporateUserTypeEnum.CORPORATE_RECRUITER;
      }
    } else if (
      actionByUserId &&
      cognitoUserGroups.includes(
        APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN
      )
    ) {
      statusTrackerActionByUserId = actionByUserId;
      statusTrackerActionByUserType = AdminRoleEnum.ADMIN;
    } else {
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }

    // Fetch job details based on job ID
    const jobDetails: DbCompanyJobDto = (
      await companyJobServiceObj.getJobById(reqBodyJobId)
    )[0];

    // Throw an error if job is not published
    if (jobDetails.status !== JobStatusEnum.PUBLISHED || jobDetails.isDeleted) {
      throw new BaseError(
        `The new job applications for this job are currently closed.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    // Check if the user has already applied for the job and throw error if already applied for the job
    let existingUserJobApplicationQueryResponse: QueryResponse<DbUserJobApplicationDto> =
      await userJobApplicationDao.getJobApplicationByjobId(
        reqBodyApplicantEmail,
        jobDetails.id
      );

    // Check if user has already applied for the job
    if (existingUserJobApplicationQueryResponse.count) {
      // Throw error if user has already applied for the job.
      throw new BaseError(
        `The application for this job is already present.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    const currentDateAndTime: string = dateHelperObj.getISODate();

    // Prepare the data required to create a new job application
    const userJobApplicationDto: UserJobApplicationMoveToApplicantCreateDto = {
      jobId: reqBodyJobId,
      companyName: reqBodyCompanyName,
      companyId: jobDetails.companyId,
      status: JobApplicationStatus.UNDER_EVALUATION,
      statusTracker: [
        {
          oldStatus: JobApplicationStatus.UNDER_EVALUATION,
          newStatus: JobApplicationStatus.UNDER_EVALUATION,
          actionDate: currentDateAndTime,
          userId: statusTrackerActionByUserId,
          userType: statusTrackerActionByUserType,
        },
      ],
      agencyUserId: reqBody.agencyUserId,
      agencyUserSubmissionId: reqBodyAgencyUserSubmissionId,
      candidateParsedCvId: reqBody.candidateParsedCvId,
      ...reqBody?.matchingScoreDetails,
    };

    // Create a new job application
    const jobApplicationDetails: DbUserJobApplicationDto =
      await userJobApplicationDao.createJobApplicationMoveToApplicant(
        reqBodyApplicantEmail, // email id of the candidate applying for the job
        userJobApplicationDto, // job application request body
        true
      );
    if (!jobApplicationDetails || !jobApplicationDetails.id) {
      throw new BaseError(
        `Unable to send for evaluation.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const countUserJobApplicationQueryResponse: QueryResponse<DbCountUserDto> =
      await countUserServiceObj.getCountUserByRegisteredEmailAndEntityType(
        reqBodyApplicantEmail,
        CountUserDbEntityTypeEnum.JOB_APPLICATION
      );
    const countUserJobApplicationData: DbCountUserDto =
      countUserJobApplicationQueryResponse[0];

    const countGlobalCompanyJobQueryResponse: QueryResponse<DbCountGlobalDto> =
      await countGlobalServiceObj.getCountGlobalByEntityType(
        CountGlobalDbEntityTypeEnum.COMPANY_JOB
      );
    const countGlobalCompanyJobData: DbCountGlobalDto =
      countGlobalCompanyJobQueryResponse[0];

    const countGlobalCandidateQueryResponse: QueryResponse<DbCountGlobalDto> =
      await countGlobalServiceObj.getCountGlobalByEntityType(
        CountGlobalDbEntityTypeEnum.CANDIDATE
      );
    const countGlobalCandidateData: DbCountGlobalDto =
      countGlobalCandidateQueryResponse[0];

    const countCompanyJobQueryResponse: QueryResponse<DbCountCompanyJobDto> =
      await countCompanyJobServiceObj.getCountCompanyJobByCompanyIdJobIdAndEntityType(
        jobDetails.companyId,
        jobDetails.id,
        CountCompanyJobDbEntityTypeEnum.JOB_APPLICATION
      );
    const countCompanyJobData: DbCountCompanyJobDto =
      countCompanyJobQueryResponse[0];

    const countCompanyQueryResponse: QueryResponse<DbCountCompanyDto> =
      await countCompanyServiceObj.getCountCompanyByCompanyIdAndEntityType(
        jobDetails.companyId,
        CountCompanyDbEntityTypeEnum.JOB_APPLICATION
      );
    const countCompanyData: DbCountCompanyDto = countCompanyQueryResponse[0];

    await Promise.all([
      countUserServiceObj.createOrUpdateCountUserForJobApplicationEntityType(
        reqBodyApplicantEmail,
        {
          userJobApplicationCounts: {
            ...countUserJobApplicationData?.userJobApplicationCounts,
            total: countUserJobApplicationData?.userJobApplicationCounts?.total
              ? countUserJobApplicationData.userJobApplicationCounts.total + 1
              : 1,
            underEvaluation: countUserJobApplicationData?.userJobApplicationCounts
              ?.underEvaluation
              ? countUserJobApplicationData.userJobApplicationCounts.underEvaluation + 1
              : 1,
          },
        },
        !!countUserJobApplicationQueryResponse.count // If count user already exists in ddb then `true` else `false`
      ),
      countGlobalServiceObj.createOrUpdateCountGlobalForCompanyJobEntityType(
        {
          companyJobApplicationCounts: {
            ...countGlobalCompanyJobData?.companyJobApplicationCounts,
            total: countGlobalCompanyJobData?.companyJobApplicationCounts?.total
              ? countGlobalCompanyJobData.companyJobApplicationCounts.total + 1
              : 1,
          },
        },
        !!countGlobalCompanyJobQueryResponse.count
      ),
      countGlobalServiceObj.createOrUpdateCountGlobalForCandidateEntityType(
        {
          candidateJobApplicationCounts: {
            ...countGlobalCandidateData?.candidateJobApplicationCounts,
            total: countGlobalCandidateData?.candidateJobApplicationCounts
              ?.total
              ? countGlobalCandidateData.candidateJobApplicationCounts.total + 1
              : 1,
          },
        },
        !!countGlobalCompanyJobQueryResponse.count
      ),
      countCompanyJobServiceObj.createOrUpdateCountCompanyJobForJobApplicationEntityType(
        jobDetails.companyId,
        jobDetails.id,
        {
          allJobApplicationCounts: {
            ...countCompanyJobData?.allJobApplicationCounts,
            total: countCompanyJobData?.allJobApplicationCounts?.total
              ? countCompanyJobData.allJobApplicationCounts.total + 1
              : 1,
          },
        },
        !!countCompanyJobQueryResponse.count
      ),
      countCompanyServiceObj.createOrUpdateCountCompanyForJobApplicationEntityType(
        jobDetails.companyId,
        {
          allJobApplicationCounts: {
            ...countCompanyData?.allJobApplicationCounts,
            total: countCompanyData?.allJobApplicationCounts?.total
              ? countCompanyData.allJobApplicationCounts.total + 1
              : 1,
          },
        },
        !!countCompanyQueryResponse.count
      ),
    ]);

    return jobApplicationDetails;
  }

  async getJobApplicationByjobId(
    applicantEmail: string,
    jobId: string
  ): Promise<QueryResponse<DbUserJobApplicationDto>> {
    return userJobApplicationDao.getJobApplicationByjobId(
      applicantEmail,
      jobId
    );
  }

  async getJobApplicationByJobIdAndApplicantEmails(
    jobId: string,
    applicantEmails: string[],
    filterOptions: {
      pageSize: number;
    }
  ) {
    const jobApplicationDetails = await userJobApplicationDao.getJobApplicationByJobIdAndApplicantEmails(
      jobId,
      applicantEmails,
      filterOptions
    );

    const {
      lastKey,
      count,
      timesQueried,
      queriedCount,
      ...userJobApplicationsData
    } = jobApplicationDetails;

    // Convert to array
    const userJobApplicationArray: DbUserJobApplicationDto[] = Object.values(
      userJobApplicationsData,
    );

    const data: PaginatedResultsWithMatchingConditionsInternalResponse<
      DbUserJobApplicationDto[]
    > = {
      data: userJobApplicationArray,
      lastKey,
      count,
      timesQueried,
      queriedCount,
    };

    return data;
  }
}

// Create an instance of the UserJobApplicationService class and export it
const userJobApplicationServiceObj = new UserJobApplicationService();
export { userJobApplicationServiceObj, UserJobApplicationService };