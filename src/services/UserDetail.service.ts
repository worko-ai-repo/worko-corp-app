
// import luxon
import { DateTime } from "luxon";

// import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import aws packages
import { AdminGetUserCommandOutput, AttributeType, UserStatusType } from "@aws-sdk/client-cognito-identity-provider";

// import configs
import APP_CONSTANTS from "../configs/constants.config";
import { awsClientCognitoIdentityProviderLibrary, awsS3ClientLibrary } from "../configs/aws-sdk.config";

// Load the local daos
import userDetailDao from "../daos/UserDetail.dao";

// Import dtos
import { UserDetailCreateDto } from "../dtos/UserDetail.dto";
import { ScheduleJobAdminCandAcctCreateSignupReminderInputDto, ScheduleJobCreateDto } from "../dtos/ScheduleJob.dto";
import { EmailTemplatePlaceholderCAND_ACCOUNT_CHANGE_PASS_SIGNUP_REMINDER, EmailTemplatePlaceholderCAND_ACCOUNT_RESET_TEMP_PASSWORD } from "../dtos/EmailTemplatePlaceholder.dto";

// Import enums
import { ScheduleJobStatus, ScheduleJobType } from "../enums/ScheduleJob.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";

// Import libraries
import { emailLibrary, EmailSourceDestinationAddress } from "../libraries/email.library";

// Import helpers
import {
  buildInternalUserCvFieldsFromCandidateParsedCv,
  generateCvSignedUrlForUserDetail,
  getUserDetailCvAwsS3Pointer,
} from "../helpers/internalUserDetail.helper";

// Load the local models
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbScheduleJobDto } from "../db/aws-dynamodb-models/ScheduleJob.model";

// Load the local services
import { scheduleJobServiceObj } from "./ScheduleJob.service";

// Load the local types
import { UserDetailProfileInfoType } from "../types/UserDetail.type";

// Inport local utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 *  UserDetailService class responsible for managing user-related operations.
 */
class UserDetailService {

  async sendEmailForCandAcctSignupReminder(
    candidateEmail: string,
    jobTitle: string,
    companyName: string,
    candidateName: string,
    temporaryPassword: string,
  ): Promise<boolean> {
    const toAddress: EmailSourceDestinationAddress = {
      email: candidateEmail,
      fullName: candidateName.toTitleCase(),
    };

    const emailPlaceholders: EmailTemplatePlaceholderCAND_ACCOUNT_CHANGE_PASS_SIGNUP_REMINDER =
      {
        candidateName: candidateName.toTitleCase(),
        candidateEmail: candidateEmail,
        jobTitle: jobTitle.toTitleCase(),
        companyName: companyName.toTitleCase(),
        candidateLoginUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_LOGIN_URL,
        candidateTemporaryPassword: temporaryPassword,
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL
      };

    await emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_ACCOUNT_CHANGE_PASS_SIGNUP_REMINDER,
      toAddress,
      emailPlaceholders
    );

    return true;
  }

  async sendNewTemporaryPasswordEmailForCandAcctSignup(
    candidateEmail: string,
    candidateName: string,
    temporaryPassword: string,
  ): Promise<boolean> {
    const toAddress: EmailSourceDestinationAddress = {
      email: candidateEmail,
      fullName: candidateName.toTitleCase(),
    };

    const emailPlaceholders: EmailTemplatePlaceholderCAND_ACCOUNT_RESET_TEMP_PASSWORD =
      {
        candidateName: candidateName.toTitleCase(),
        candidateEmail: candidateEmail,
        candidateLoginUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_LOGIN_URL,
        candidateTemporaryPassword: temporaryPassword,
        ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL
      };

    await emailLibrary.sendEmail(
      EmailTemplateEnum.CAND_ACCOUNT_RESET_TEMP_PASSWORD,
      toAddress,
      emailPlaceholders
    );

    return true;
  }

  async scheduleCandChangePassSignupReminder(
    scheduleJobCandAcctCreateSignupReminderInput: ScheduleJobAdminCandAcctCreateSignupReminderInputDto
  ): Promise<boolean> {
    const delay: number = APP_CONSTANTS.CAND_CHANGE_PASS_SIGNUP_REMINDER_DELAY;

    // Calculate the schedule time
    const scheduleTime: DateTime<true> = DateTime.now().plus({
      milliseconds: delay,
    });

    // Create the payload for scheduling the job
    const scheduleJobPayload: ScheduleJobCreateDto = {
      type: ScheduleJobType.ADMIN_CAND_ACCOUNT_CREATE_SIGNUP_REMINDER,
      scheduleTime: scheduleTime.toUTC().toFormat("yyyy-MM-dd'T'HH:mm:ss"),
      input: scheduleJobCandAcctCreateSignupReminderInput,
      desc: `Check candidate signup reminder for ${scheduleJobCandAcctCreateSignupReminderInput.candidateEmail} if still not registered.`,
      status: ScheduleJobStatus.SCHEDULED,
    };

    // Prepare scheduler lambda arn
    const schedulerLambdaArn: string = APP_CONSTANTS.AWS_EVENT_BRIDGE_SCHEDULER_ARNS.WORKO_CORP_APP_SCHEDULER_LAMBDA_ARN.strtr({
      "{serverlessFunctionName}": APP_CONSTANTS.SERVERLESS_FUNCTION_NAMES.WORKO_CORP_APP_SCHEDULER_HANDLER
    });

    // Schedule the job
    const scheduledJob: DbScheduleJobDto =
      await scheduleJobServiceObj.createScheduleJob(scheduleJobPayload, schedulerLambdaArn);

    if (!scheduledJob) {
      global.logger.error("Failed to schedule the job", {
        methodName: this.scheduleCandChangePassSignupReminder.name,
        scheduledJob,
      });
      return false;
    }

    return true;
  }

  async reviewCandidateChangePassSignupReminder(
    candAcctCreateSignupReminderInput: ScheduleJobAdminCandAcctCreateSignupReminderInputDto
  ): Promise<boolean> {
    const { 
      candidateCognitoUserId, candidateEmail, reminderSendCount,
      candidateName, jobTitle, companyName, temporaryPassword
    } =
      candAcctCreateSignupReminderInput;

    const workoUserPoolId: string | undefined =
      process.env.APP_AWS_WORKO_COGNITO_USER_POOL_ID;
    if (!workoUserPoolId) {
      global.logger.error(`Worko User Pool Id not found`, {
        methodName: this.reviewCandidateChangePassSignupReminder.name,
        candAcctCreateSignupReminderInput,
      });
      throw new BaseError(
        "Worko User Pool Id not found.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const candidateCognitoUserDetails: AdminGetUserCommandOutput =
      await awsClientCognitoIdentityProviderLibrary.getUserDetails(
        workoUserPoolId,
        candidateCognitoUserId
      );
    if (!candidateCognitoUserDetails) {
      global.logger.error(`Cognito user details not found`, {
        methodName: this.reviewCandidateChangePassSignupReminder.name,
        candAcctCreateSignupReminderInput,
      });
      throw new BaseError(
        "Cognito user details not found.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const candidateCognitoUserEmail: string | undefined =
      candidateCognitoUserDetails?.UserAttributes?.find(
        (attr: AttributeType) => attr.Name === "email"
      )?.Value;

    if(candidateCognitoUserEmail !== candidateEmail) {
      global.logger.error(`Candidate email not found`, {
        methodName: this.reviewCandidateChangePassSignupReminder.name,
        candAcctCreateSignupReminderInput,
        candidateCognitoUserDetails,
      });
      throw new BaseError(
        "Candidate email not found.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const isCandidateCognitoUserEmailVerified: boolean =
      candidateCognitoUserDetails?.UserAttributes?.find(
        (attr: AttributeType) => attr.Name === "email_verified"
      )?.Value === "true";

    if (
      candidateCognitoUserDetails.UserStatus === UserStatusType.CONFIRMED &&
      isCandidateCognitoUserEmailVerified 
    ) {
      global.logger.info(
        `Candidate account is already verified, so no need to send signup reminder.`,
        {
          methodName: this.reviewCandidateChangePassSignupReminder.name,
          candAcctCreateSignupReminderInput,
          candidateCognitoUserDetails,
        }
      )
      return true;
    }

    global.logger.info(
      `Candidate account not verified, so check reminder limit and send signup reminder accordingly.`,
      {
        methodName: this.reviewCandidateChangePassSignupReminder.name,
        candAcctCreateSignupReminderInput,
        candidateCognitoUserDetails,
      }
    );

    if(reminderSendCount >= 7) {
      global.logger.info(
        `Candidate signup reminder limit reached, so no need to send signup reminder.`,
        {
          methodName: this.reviewCandidateChangePassSignupReminder.name,
          candAcctCreateSignupReminderInput,
          candidateCognitoUserDetails,
        }
      )
      return true;
    }

    await this.sendEmailForCandAcctSignupReminder(
      candidateEmail,
      jobTitle,
      companyName,
      candidateName,
      temporaryPassword
    );

    await this.scheduleCandChangePassSignupReminder(
      {
        candidateEmail,
        candidateName,
        jobTitle,
        companyName,
        temporaryPassword,
        candidateCognitoUserId,
        reminderSendCount : reminderSendCount + 1
      }
    );

    return true;
  }

  async createUserDetail(
    createUserDetailDto: UserDetailCreateDto
  ): Promise<DbUserDetailDto> {
    return userDetailDao.createUserDetail(createUserDetailDto);
  }

  /**
   * Backfills CV S3 pointer on internal UserDetail from candidateParsedCv when missing.
   */
  async syncInternalUserCvPointerFromCandidateParsedCv(
    existingUser: DbUserDetailDto,
    candidateParsedCv: DbCandidateParsedCvDto
  ): Promise<void> {
    const email: string | undefined = existingUser.emailList?.primary;
    if (!email || !existingUser.SK || !existingUser.isUserCreatedInternally) {
      return;
    }

    const s3Pointer = getUserDetailCvAwsS3Pointer(existingUser);
    if (s3Pointer.cvAwsS3ResourceType) {
      return;
    }

    const cvFields = buildInternalUserCvFieldsFromCandidateParsedCv(candidateParsedCv);
    await userDetailDao.update(email, existingUser.SK, cvFields);
  }

  /**
   * Retrieves user details by email id.
   *
   * @param {string} email - Email of the user
   * @returns {Promise<QueryResponse<DbUserDetailDto>>} - Details of the user
   */
  async get(email: string): Promise<QueryResponse<DbUserDetailDto>> {
    // logger
    global.logger.info("Get user detail by email [service]", {
      filePath: __filename,
      methodName: this.get.name,
      email,
    });

    // Return the user details
    return userDetailDao.get(email);
  }

  /**
   * getUserDetailsByEmail
   *
   * Retrieves user details by email id and parses the result.
   *
   * @param email - Email of the user
   * @returns {Promise<DbUserDetailDto>} - Details of the user
   * @throws {BaseError} If the user details are not found
   */
  async getUserDetailsByEmail(email: string): Promise<DbUserDetailDto> {
    // get candidate details by candidateEmailId and throw error if not found
    const candidateDetails: QueryResponse<DbUserDetailDto> =
      await userDetailDao.get(email);
    if (!candidateDetails.count) {
      throw new BaseError(
        `Candidate details not found with candidate EmailId ${email}. Please check the information and try again.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return candidateDetails[0];
  }

  /**
   * Retrieves user profile details by email id.
   *
   * @param email - Email of the user
   * @returns {Promise<UserDetailProfileInfoType>} - Details of the user including
   *  - userDetails: DbUserDetailDto
   *  - cvAwsS3SignedUrl: string | null - Signed URL to download the CV
   *  - profileImageAwsS3SignedUrl: string | null - Signed URL to view the Profile
   * @throws {BaseError} If the user details are not found
   */
  async getUserProfileDetailsByEmail(
    email: string
  ): Promise<UserDetailProfileInfoType> {
    global.logger.info("Get user profile details by email [service]");

    // Get user details by email
    const userDetails: DbUserDetailDto = await this.getUserDetailsByEmail(
      email
    );

    // Prepare the user id
    let userId: string = userDetails.SK?.split("#").pop() ?? "";
    global.logger.debug(`userId to get user profile details : `, {
      userId,
    });

    let cvAwsS3SignedUrl = null;
    let profileImageAwsS3SignedUrl = null;

    if (userDetails.CV || userDetails.isUserCreatedInternally) {
      cvAwsS3SignedUrl = await generateCvSignedUrlForUserDetail(
        userDetails,
        email
      );

      global.logger.debug(`CV details: `, {
        userId,
        cvAwsS3SignedUrl,
        isUserCreatedInternally: userDetails.isUserCreatedInternally,
      });
    }

    // Gnereta e signed url to view the Profile
    if (userDetails.profileImage) {
      // Construct the file path in the cloud storage
      const filePath: string =
        APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_PROFILE_PIC.strtr({
          "{userId}": userId,
        });

      // Assume that you have a method to generate the object URL
      profileImageAwsS3SignedUrl = await awsS3ClientLibrary.generateObjectUrl(
        process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
        filePath + "/" + userDetails.profileImage
      );

      global.logger.debug(`profileImage details: `, {
        filePath,
        profileImageAwsS3SignedUrl,
      });
    }

    const userProfileDetails: UserDetailProfileInfoType = {
      userDetails,
      cvAwsS3SignedUrl,
      profileImageAwsS3SignedUrl,
    };
    global.logger.debug(`userProfileDetails: `, {
      userProfileDetails,
    });

    return userProfileDetails;
  }

  /**
   * Retrieves user details by user id.
   *
   * @param userId - ID of the user
   * @returns {Promise<QueryResponse<DbUserDetailDto>>>} - Details of the user
   */
  async getUserById(userId: string): Promise<QueryResponse<DbUserDetailDto>> {
    console.log("Get user detail by userId [service]");
    return userDetailDao.getUserById(userId);
  }

  /**
   * getUserByIdOne
   *
   * Retrieves user details by user id and parses the result.
   *
   * @param userId - ID of the user
   * @throws {BaseError} If the user details are not found
   * @returns {Promise<DbUserDetailDto>} - Details of the user
   */
  async getUserByIdOne(userId: string): Promise<DbUserDetailDto> {
    global.logger.info(`Get user detail by userId with parsing [service]`, {
      filePath: __filename,
      methodName: this.getUserByIdOne.name,
      userId,
    });

    // Get the user details by userId and throw error if not found
    const userDetail: QueryResponse<DbUserDetailDto> =
      await userDetailDao.getUserById(userId);
    if (!userDetail.count) {
      throw new BaseError(
        `User Details Not Found`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Return the parsed user details
    return userDetail[0];
  }
}

// Export an instance of the UserService class
export default new UserDetailService();
