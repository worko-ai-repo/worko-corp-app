
// Import aws lambda related types
import { Context, SQSEvent } from "aws-lambda";

// Import extensions
import "./extensions/string.extension";

// Import libraries
import "./libraries/logger.library";

// Import configurations
import DBConfig from "./db/DB.config";
import "./configs/gcp-sdk.config";

// Import dtos
import {
   SqsMsgAdminCandProfileBulkUploadReqDto,
   SqsMsgAgencyBulkJdResumePostMatchingScoreReqDto,
   SqsMsgCorporateCandProfileBulkUploadReqDto,
   SqsMsgCorporateCandProfileReferralSourceReqDto,
   SqsMsgOlderCvAdminCandProfileBulkUploadReqDto,
   SqsMsgOlderCvCorporateCandProfileBulkUploadReqDto,
} from "./dtos/SqsEvent.dto";

// Import enums
import { SqsMsgEventEnum } from "./enums/SqsEvent.enum";

// Import services
import { agencyBulkJdResumeServiceObj } from "./services/AgencyBulkJdResume.service";
import { corporateCandidateProfileServiceObj } from "./services/CorporateCandidateProfile.service";
import { centralCandidateProfileServiceObj } from "./services/CentralCandidateProfile.service";

// Import utils
import { BaseError } from "./utils/errors.util";
import HttpStatusCode from "./utils/http-codes.util";
import { responseHandlerUtilObj } from "./utils/response-handler.util";


const initDatabaseConfig = () => {
  // Create a new database configuration instance
  const dbConf = new DBConfig();

  // Initialize the database configuration
  dbConf.init();
};

// Initialize the database configuration
initDatabaseConfig();

const validateAgencyBulkJdResumePostMatchingScore = async (
  message: SqsMsgAgencyBulkJdResumePostMatchingScoreReqDto,
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    global.logger.debug(
      `Details of sqs event for Agency bulk jd resume matching score validation: `,
      {
        methodName: "validateAgencyBulkJdResumePostMatchingScore",
        message: message,
        event: event,
        context: context,
      }
    );

    // Retrieve the necessary information from the message
    const { agencyBulkJdResumeId } = message;

    const isAgencyBulkJdResumePostMatchingScoreValid: boolean =
      await agencyBulkJdResumeServiceObj.validateAgencyBulkJdResumePostMatchingScore(
        agencyBulkJdResumeId
      );

    // Return success response if validation was successful
    if (isAgencyBulkJdResumePostMatchingScoreValid) {
      return responseHandlerUtilObj.sendSuccess(
        HttpStatusCode.OK_200,
        "Agency bulk jd resume matching score validated successfully."
      );
    } else {
      // Throw custom error if validation failed
      throw new BaseError(
        `Unable to validate Agency bulk jd resume matching score".`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  } catch (error: any) {
    // Return error response if validation failed
    return responseHandlerUtilObj.sendError(
      error,
      error?.errorMsg ?? error?.message
    );
  }
};

const validateCorporateCandProfileBulkUpload  = async (
  message: SqsMsgCorporateCandProfileBulkUploadReqDto,
): Promise<object> => {
  try {
    const { companyId, candidateCvAwsS3FileName, cvExtractedParsed } = message;

    if(!companyId || !candidateCvAwsS3FileName || !cvExtractedParsed){
      global.logger.error(`Missing companyId or candidateCvAwsS3FileName or cvExtractedParsed [Controller]`, {
        candidateCvAwsS3FileName,
        cvExtractedParsed,
        companyId
      })
      throw new BaseError(
        `Unable to validate Corporate candidate profile bulk upload."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    const corpCandProfileActivityStatus: boolean = await corporateCandidateProfileServiceObj.validateCorporateCandidateProfileBulkUpload(
      companyId,
      candidateCvAwsS3FileName,
      cvExtractedParsed
    );

    // Return success response if validation was successful
    if (corpCandProfileActivityStatus) {
      return responseHandlerUtilObj.sendSuccess(
        HttpStatusCode.OK_200,
        "Corporate candidate profile bulk upload validated successfully."
      );
    } else {
      // Throw custom error if validation failed
      throw new BaseError(
        `Unable to validate Corporate candidate profile bulk upload."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  } catch (error:any) {
    global.logger.error(`validateCorporateCandProfileBulkUpload error [Controller]`, {
      methodName: "validateCorporateCandProfileBulkUpload",
      error,
    })
    // Return error response if validation failed
    return responseHandlerUtilObj.sendError(
      error,
      error?.errorMsg ?? error?.message
    );
  }
};

const validateOlderCvCorporateCandProfileBulkUpload  = async (
  message: SqsMsgOlderCvCorporateCandProfileBulkUploadReqDto
) => {
  try {
    const { companyId, candidateCvAwsS3FileName, cvExtractedParsed } = message;

    if(!companyId || !candidateCvAwsS3FileName || !cvExtractedParsed){
      global.logger.error(`Missing companyId or candidateCvAwsS3FileName or cvExtractedParsed [Controller]`, {
        candidateCvAwsS3FileName,
        cvExtractedParsed,
        companyId
      })
      throw new BaseError(
        `Unable to validate Older cv Corporate candidate profile bulk upload."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    const corpCandProfileActivityStatus: boolean = await corporateCandidateProfileServiceObj.validateOlderCvCorporateCandidateProfileBulkUpload(
      companyId,
      candidateCvAwsS3FileName,
      cvExtractedParsed
    );

    // Return success response if validation was successful
    if (corpCandProfileActivityStatus) {
      return responseHandlerUtilObj.sendSuccess(
        HttpStatusCode.OK_200,
        "Older cv Corporate candidate profile bulk upload validated successfully."
      );
    } else {
      // Throw custom error if validation failed
      throw new BaseError(
        `Unable to validate Older cv Corporate candidate profile bulk upload."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  } catch (error:any) {
    global.logger.error(`validateOlderCvCorporateCandProfileBulkUpload error [Controller]`, {
      methodName: "validateOlderCvCorporateCandProfileBulkUpload",
      error,
    })
    // Return error response if validation failed
    return responseHandlerUtilObj.sendError(
      error,
      error?.errorMsg ?? error?.message
    );
  }
}

const validateAdminCandProfileBulkUpload = async (
  message: SqsMsgAdminCandProfileBulkUploadReqDto
): Promise<object> => {
  try {
    const { candidateCvAwsS3FileName, cvExtractedParsed } = message;

    if(!candidateCvAwsS3FileName || !cvExtractedParsed){
      global.logger.error(`Missing candidateCvAwsS3FileName or cvExtractedParsed [Controller]`, {
        candidateCvAwsS3FileName,
        cvExtractedParsed
      });
      throw new BaseError(
        `Unable to validate Admin candidate profile bulk upload."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    const adminCandProfileActivityStatus: boolean = await centralCandidateProfileServiceObj.validateCentralCandidateProfileBulkUpload(
      candidateCvAwsS3FileName,
      cvExtractedParsed
    );

    // Return success response if validation was successful
    if (adminCandProfileActivityStatus) {
      return responseHandlerUtilObj.sendSuccess(
        HttpStatusCode.OK_200,
        "Admin candidate profile bulk upload validated successfully."
      );
    } else {
      // If duplicate candidate profile is found, it will return false
      // Throw custom error if validation failed
      throw new BaseError(
        `Unable to validate Admin candidate profile bulk upload."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  } catch (error:any) {
    global.logger.error(`validateAdminCandProfileBulkUpload error [Controller]`, {
      methodName: "validateAdminCandProfileBulkUpload",
      error,
    })
    // Return error response if validation failed
    return responseHandlerUtilObj.sendError(
      error,
      error?.errorMsg ?? error?.message
    );
  }
}

const validateOlderCvAdminCandProfileBulkUpload = async (
  message: SqsMsgOlderCvAdminCandProfileBulkUploadReqDto
) => {
  try {
    const { candidateCvAwsS3FileName, cvExtractedParsed } = message;

    if(!candidateCvAwsS3FileName || !cvExtractedParsed){
      global.logger.error(`Missing candidateCvAwsS3FileName or cvExtractedParsed [Controller]`, {
        candidateCvAwsS3FileName,
        cvExtractedParsed
      });
      throw new BaseError(
        `Unable to validate Older cv Admin candidate profile bulk upload."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    const adminCandProfileActivityStatus: boolean = await centralCandidateProfileServiceObj.validateCentralCandidateProfileBulkUpload(
      candidateCvAwsS3FileName,
      cvExtractedParsed
    );

    // Return success response if validation was successful
    if (adminCandProfileActivityStatus) {
      return responseHandlerUtilObj.sendSuccess(
        HttpStatusCode.OK_200,
        "Older cv Admin candidate profile bulk upload validated successfully."
      );
    } else {
      // If duplicate candidate profile is found, it will return false
      // Throw custom error if validation failed
      throw new BaseError(
        `Unable to validate Older cv Admin candidate profile bulk upload."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  } catch (error:any) {
    global.logger.error(`validateOlderCvAdminCandProfileBulkUpload error [Controller]`, {
      methodName: "validateOlderCvAdminCandProfileBulkUpload",
      error,
    })
    // Return error response if validation failed
    return responseHandlerUtilObj.sendError(
      error,
      error?.errorMsg ?? error?.message
    );
  }
}

const validateCorporateCandProfileReferralSource = async (
  message: SqsMsgCorporateCandProfileReferralSourceReqDto
) => {
  try {
    const { companyId, candidateCvAwsS3FileName, cvExtractedParsed } = message;

    if(!companyId || !candidateCvAwsS3FileName || !cvExtractedParsed){
      global.logger.error(`Missing companyId or candidateCvAwsS3FileName or cvExtractedParsed [Controller]`, {
        candidateCvAwsS3FileName,
        cvExtractedParsed,
        companyId
      });
      throw new BaseError(
        `Unable to validate Corporate candidate profile referral source."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }

    const corpCandProfileActivityStatus: boolean = await corporateCandidateProfileServiceObj.validateCorporateCandProfileReferralSource(
      companyId,
      candidateCvAwsS3FileName,
      cvExtractedParsed
    );

    // Return success response if validation was successful
    if (corpCandProfileActivityStatus) {
      return responseHandlerUtilObj.sendSuccess(
        HttpStatusCode.OK_200,
        "Corporate candidate profile referral source validated successfully."
      );
    } else {
      // Throw custom error if validation failed
      throw new BaseError(
        `Unable to validate Corporate candidate profile referral source."`,
        HttpStatusCode.BAD_REQUEST_400
      );
    }
  } catch (error:any) {
    global.logger.error(`validateCorporateCandProfileReferralSource error [Controller]`, {
      methodName: "validateCorporateCandProfileReferralSource",
      error,
    })
    // Return error response if validation failed
    return responseHandlerUtilObj.sendError(
      error,
      error?.errorMsg ?? error?.message
    );
  }
}

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<object> => {
  try {
    // Log received SQS event
    global.logger.info("App event trigger: Received event from SQS: ", {
      methodName: "handler",
      event: event,
    });

    // Extract message body from event
    let messageBody: string = event.Records[0].body;
    global.logger.info("App event trigger: messageBody: ", {
      methodName: "handler",
      messageBody: messageBody,
    })

    // Convert message body to string if not already a string
    if (typeof messageBody !== "string") {
      global.logger.info(
        `Before converting messageBody to string:`,
        {
          messageBody: messageBody,
          methodName: "handler",
        }
      )
      messageBody = JSON.stringify(messageBody);
      global.logger.info(
        `After converting messageBody to string:`,
        {
          messageBody: messageBody,
          methodName: "handler",
        }
      );
    }

    // Parse message body
    const parsedMessageBody = JSON.parse(messageBody);
    const messageEvent: string = parsedMessageBody.event;

    global.logger.info("App event trigger: parsedMessageBody and messageEvent: ", {
      methodName: "handler",
      parsedMessageBody: parsedMessageBody,
      messageEvent: messageEvent,
    });

    switch (messageEvent) {
      // After calculating matching score for resume this event is triggered
      case SqsMsgEventEnum.AGENCY_BULK_JD_RESUME_POST_MATCHING_SCORE:
        return validateAgencyBulkJdResumePostMatchingScore(
          parsedMessageBody as SqsMsgAgencyBulkJdResumePostMatchingScoreReqDto,
          event,
          context
        );

      case SqsMsgEventEnum.CORPORATE_CAND_PROFILE_BULK_UPLOAD:
        return validateCorporateCandProfileBulkUpload(parsedMessageBody as SqsMsgCorporateCandProfileBulkUploadReqDto);

      case SqsMsgEventEnum.OLDER_CV_CORPORATE_CAND_PROFILE_BULK_UPLOAD:
        return validateOlderCvCorporateCandProfileBulkUpload(parsedMessageBody as SqsMsgOlderCvCorporateCandProfileBulkUploadReqDto);

      case SqsMsgEventEnum.ADMIN_CAND_PROFILE_BULK_UPLOAD:
        return validateAdminCandProfileBulkUpload(parsedMessageBody as SqsMsgAdminCandProfileBulkUploadReqDto);

      case SqsMsgEventEnum.OLDER_CV_ADMIN_CAND_PROFILE_BULK_UPLOAD:
        return validateOlderCvAdminCandProfileBulkUpload(parsedMessageBody as SqsMsgOlderCvAdminCandProfileBulkUploadReqDto);
        
      case SqsMsgEventEnum.CORPORATE_CAND_PROFILE_REFERRAL_SOURCE: 
        return validateCorporateCandProfileReferralSource(parsedMessageBody as SqsMsgCorporateCandProfileReferralSourceReqDto);

      default:
        // Throw error if event type is invalid
        throw new BaseError(
          `The provided event ${messageEvent} is invalid, therefore it cannot be processed.`
        );
    }
  } catch (error: any) {
    global.logger.error("App event trigger: Error occurred: ", {
      methodName: "handler",
      error: error,
    });

    // Return error response if an unexpected error occurred
    return responseHandlerUtilObj.sendError(
      error,
      "An unexpected error occurred."
    );
  }
};
