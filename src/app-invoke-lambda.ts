
import { Context } from "aws-lambda";

// Import extensions (must be done after natural imports and before any scope-modifying imports)
import "./extensions/string.extension";

// Import logger library
import "./libraries/logger.library";

// Import database configuration
import DBConfig from "./db/DB.config";
import "./configs/gcp-sdk.config";

// Import dtos
import { InvokeLambdaCandidateBulkMoveToApplicantDto, InvokeLambdaHandlerEventPayloadDto } from "./dtos/InvokeLambda.dto";

// Import enums
import { InvokeLambdaHandlerEventTypeEnum } from "./enums/InvokeLambda.enum";

// Import models
import { DbUserJobApplicationDto } from "./db/aws-dynamodb-models/UserJobApplication.model";

// Import services
import { candidateParsedCvServiceObj } from "./services/CandidateParsedCv.service";

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

const sendErrResponse = async (
  error: any,
  message: string,
  consoleResponse: boolean = true,
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

const sendSuccessResponse = async (
  statusCode: HttpStatusCode,
  message: string,
  consoleResponse: boolean = true,
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
  event: InvokeLambdaHandlerEventPayloadDto,
  context: Context,
): Promise<object> => {
  try {
    // Log the receipt of the event
    global.logger.info("App Invoke Lambda handler: Received event: ", {
      methodName: "handler",
      event,
      context,
    });

    const {eventType, data} = event;

    switch (eventType) {
      case InvokeLambdaHandlerEventTypeEnum.CANDIDATE_BULK_MOVE_TO_APPLICANT: {
        const {
          candidateParsedCvId,
          jobId,
          companyName,
          jobTitle,
          cognitoUserGroups,
          actionByUserId,
          actionByCorporateUserId,
          currentCTC,
          expectedCTC,
          noticePeriod
        } = data as InvokeLambdaCandidateBulkMoveToApplicantDto;
        const response: DbUserJobApplicationDto = await candidateParsedCvServiceObj.moveToApplicantCandidateParsedCv(
          {
            candidateParsedCvId,
            currentCTC,
            expectedCTC,
            noticePeriod,
            jobId,
            companyName,
            jobTitle,
          },
          cognitoUserGroups,
          actionByUserId,
          actionByCorporateUserId
        );
        global.logger.info("App Invoke Lambda handler: Bulk move to applicant Response: ", {
          methodName: "handler",
          response
        })
        break;
      }

      default: {
        throw new BaseError(`No invoked lambda event type found.`);
      }
    }

    // Return success response
    return sendSuccessResponse(
      HttpStatusCode.OK_200,
      `Invoked lambda processed successfully.`,
    );
  } catch (error: any) {
    global.logger.error("App invoked lambda handler [Error]: ", {
      methodName: "handler",
      error,
    });

    // Return error response
    return sendErrResponse(
      error,
      error?.errorMsg ??
        error?.message ??
        "An error occurred while processing the invoked lambda.",
    );
  }
};