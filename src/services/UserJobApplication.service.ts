
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import configs
import APP_CONSTANTS from "../configs/constants.config";

// import daos
import { userJobApplicationDao } from "../daos/UserJobApplication.dao";

// import dtos
import { UserJobApplicationMoveToApplicantCreateApiDTO, UserJobApplicationMoveToApplicantCreateDto, UserJobApplicationSendForEvaluationCreateApiDTO } from "../dtos/UserJobApplication.dto";

// import enums
import { AdminRoleEnum } from "../enums/Common.enum";
import { CorporateUserTypeEnum } from "../enums/CorporateUser.enum";
import { JobStatusEnum } from "../enums/Job.enum";
import { JobApplicationStatus } from "../enums/UserJobApplication.enum";
import { CountGlobalDbEntityTypeEnum } from "../enums/CountGlobal.enum";
import { CountCompanyJobDbEntityTypeEnum } from "../enums/CountCompanyJob.enum";
import { CountUserDbEntityTypeEnum } from "../enums/CountUser.enum";
import { CountCompanyDbEntityTypeEnum } from "../enums/CountCompany.enum";

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

// import models
import { DbCompanyJobDto } from "../db/aws-dynamodb-models/CompanyJob.model";
import { DbUserJobApplicationDto } from "../db/aws-dynamodb-models/UserJobApplication.model";
import { DbCountUserDto } from "../db/aws-dynamodb-models/CountUser.model";
import { DbCountGlobalDto } from "../db/aws-dynamodb-models/CountGlobal.model";
import { DbCountCompanyDto } from "../db/aws-dynamodb-models/CountCompany.model";
import { DbCountCompanyJobDto } from "../db/aws-dynamodb-models/CountCompanyJob.model";

/**
 * UserJobApplicationService
 * 
 * Service for handling user job application-related operations
 */
class UserJobApplicationService {
  async createJobApplicationMoveToApplicant(
    reqBody: UserJobApplicationMoveToApplicantCreateApiDTO,
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
      status: JobApplicationStatus.ACCEPTED,
      statusTracker: [
        {
          oldStatus: JobApplicationStatus.ACCEPTED,
          newStatus: JobApplicationStatus.ACCEPTED,
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

    await Promise.all([
      countUserServiceObj.createOrUpdateCountUserForJobApplicationEntityType(
        reqBodyApplicantEmail,
        {
          userJobApplicationCounts: {
            ...countUserJobApplicationData?.userJobApplicationCounts,
            total: countUserJobApplicationData?.userJobApplicationCounts?.total
              ? countUserJobApplicationData.userJobApplicationCounts.total + 1
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
        userJobApplicationDto // job application request body
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
}

// Create an instance of the UserJobApplicationService class and export it
const userJobApplicationServiceObj = new UserJobApplicationService();
export { userJobApplicationServiceObj, UserJobApplicationService };