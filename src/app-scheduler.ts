// Import AWS Lambda types
import { Context, ScheduledEvent } from "aws-lambda";

// Import extensions (must be done after natural imports and before any scope-modifying imports)
import "./extensions/string.extension";

// Import logger library
import "./libraries/logger.library";

// Import database configuration
import DBConfig from "./db/DB.config";
import "./configs/gcp-sdk.config";

// Import dtos
import { ScheduledEventCustomDto, ScheduleJobAdminCandAcctCreateSignupReminderInputDto } from "./dtos/ScheduleJob.dto";

// Import enums
import { ScheduleJobType } from "./enums/ScheduleJob.enum";

// Import models
import { DbScheduleJobDto } from "./db/aws-dynamodb-models/ScheduleJob.model";

// Import services
import {
   scheduleJobServiceObj
} from "./services/ScheduleJob.service";
import UserDetailService from "./services/UserDetail.service";

// Import utils
import { BaseError } from "./utils/errors.util";
import HttpStatusCode from "./utils/http-codes.util";

/**
 * Initializes the database configuration.
 */
const initDatabaseConfig = () => {
  // Create a new database configuration instance
  const dbConf = new DBConfig();

  // Initialize the database configuration
  dbConf.init();
};

// Initialize the database configuration
initDatabaseConfig();

/**
 * Sends an error response.
 *
 * @param {any} error - The error object.
 * @param {string} message - The error message to return in the response.
 * @param {boolean} [consoleResponse=true] - Whether to log the error response to the console.
 * @returns {Promise<object>} The formatted error response object.
 */
const sendErrResponse = async (
  error: any,
  message: string,
  consoleResponse: boolean = true
): Promise<object> => {
  // Prepare the error response
  const response = {
    statusCode: error.statusCode ?? HttpStatusCode.INTERNAL_SERVER_ERROR_500,
    body: JSON.stringify({
      message: message,
      error: error.message ?? "Internal Server Error",
    }),
  };

  // Log the response if required
  if (consoleResponse) {
    global.logger.info("sendErrResponse: ", {
      filePath: __filename,
      methodName: "sendErrResponse",
      response: JSON.stringify(response),
    });
  }

  return response;
};

/**
 * Sends a success response.
 *
 * @param {number} statusCode - The HTTP status code to return.
 * @param {string} message - The success message to return in the response.
 * @param {boolean} [consoleResponse=true] - Whether to log the success response to the console.
 * @returns {Promise<object>} The formatted success response object.
 */
const sendSuccessResponse = async (
  statusCode: HttpStatusCode,
  message: string,
  consoleResponse: boolean = true
): Promise<object> => {
  // Prepare the success response
  const response = {
    statusCode: statusCode,
    body: JSON.stringify({
      message: message,
    }),
  };

  // Log the response if required
  if (consoleResponse) {
    global.logger.info("sendSuccessResponse: ", {
      filePath: __filename,
      methodName: "sendSuccessResponse",
      response: response,
    });
  }

  return response;
};

export const handler = async (
  event: ScheduledEventCustomDto, // This is used by us
  context: Context
): Promise<object> => {
  try {
    // Log the receipt of the event
    global.logger.info(
      "App scheduler handler: Received event from scheduler: ",
      {
        methodName: "handler",
        event,
        context,
      }
    );

    // Extract scheduleJobId from the event object
    const scheduleJobId: string = event.scheduleJobId;

    // Fetch the scheduled job by its ID and validate its existence
    const scheduleJob: DbScheduleJobDto = await scheduleJobServiceObj.getScheduleJobById(
      scheduleJobId
    );
    if (!scheduleJob) {
      throw new BaseError(
        `The schedule job with the provided ID "${scheduleJobId}" was not found.`
      );
    }

    global.logger.info("App scheduler handler: scheduleJob input details: ", {
      methodName: "handler",
      scheduledJob: scheduleJob,
    });

    // Process the scheduled job based on its type
    switch (scheduleJob.type) {
      case ScheduleJobType.ADMIN_CAND_ACCOUNT_CREATE_SIGNUP_REMINDER: {
        const candAcctCreateSignupReminderInputDetails =
          scheduleJob.input as ScheduleJobAdminCandAcctCreateSignupReminderInputDto;

        global.logger.info(
          `App scheduler handler: ${scheduleJob.type} input details: `,
          {
            methodName: "handler",
            candAcctCreateSignupReminderInputDetails,
          }
        );

        await UserDetailService.reviewCandidateChangePassSignupReminder(
          candAcctCreateSignupReminderInputDetails,
        );
        break;
      }

      // Handle unknown or unsupported schedule job types
      default: {
        throw new BaseError(
          `No schedule found for job type: ${scheduleJob.type}`
        );
      }
    }

    // Mark the scheduled job as completed
    await scheduleJobServiceObj.completeScheduleJob(scheduleJobId);

    // Return success response
    return sendSuccessResponse(
      HttpStatusCode.OK_200,
      `Scheduled job ${scheduleJobId} processed successfully.`
    );
  } catch (error: any) {
    global.logger.error("App scheduler handler [Error]: ", {
      methodName: "handler",
      error,
    });

    // Return error response
    return sendErrResponse(
      error,
      error?.errorMsg ??
        error?.message ??
        "An error occurred while processing the scheduled job."
    );
  }
};
