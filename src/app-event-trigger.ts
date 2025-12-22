/**
 * @note  
 *  1. This will be used if we want to use SQS trigger
 */

/*
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
   SqsMsgAgencyBulkJdResumePostMatchingScoreReqDto,
   SqsMsgBaseReqDto,
} from "./dtos/SqsEvent.dto";

// Import enums
import { SqsMsgEventEnum } from "./enums/SqsEvent.enum";

// Import services
import { agencyBulkJdResumeServiceObj } from "./services/AgencyBulkJdResume.service";

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
    const { agencyBulkJdResumeId } = message.context;

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

    global.logger.info(`App event trigger: messageBody: ${messageBody}`, {
      methodName: "handler",
    });

    // Convert message body to string if not already a string
    if (typeof messageBody !== "string") {
      messageBody = JSON.stringify(messageBody);
      global.logger.info(
        `App event trigger: messageBody (converted to string): ${messageBody}`,
        {
          methodName: "handler",
        }
      );
    }

    // Parse message body
    const parsedMessageBody = JSON.parse(messageBody);

    // Extract message and event type
    const parsedMessage: SqsMsgBaseReqDto = parsedMessageBody;
    const messageEvent: string = parsedMessage.event;

    global.logger.info("App event trigger: parsedMessage and messageEvent: ", {
      methodName: "handler",
      parsedMessageBody: parsedMessageBody,
      parsedMessage: parsedMessage,
      messageEvent: messageEvent,
    });

    // Handle different event types
    if (
      // After calculating matching score for resume this event is triggered
      messageEvent === SqsMsgEventEnum.AGENCY_BULK_JD_RESUME_POST_MATCHING_SCORE
    ) {
      return validateAgencyBulkJdResumePostMatchingScore(
        parsedMessage as SqsMsgAgencyBulkJdResumePostMatchingScoreReqDto,
        event,
        context
      );
    }

    // Throw error if event type is invalid
    throw new BaseError(
      `The provided event ${messageEvent} is invalid, therefore it cannot be processed.`
    );
  } catch (error: any) {
    // Return error response if an unexpected error occurred
    return responseHandlerUtilObj.sendError(
      error,
      "An unexpected error occurred."
    );
  }
};
*/