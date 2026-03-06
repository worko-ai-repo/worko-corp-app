
// Import aws lambda related types
import { APIGatewayProxyResult, Context } from 'aws-lambda';

// Import extensions
import "./extensions/string.extension";

// Import libraries
import "./libraries/logger.library";

// Import configs
import "./configs/gcp-sdk.config";

// Import dtos
import { InvokeLambdaSourceTypeBulkJdResumeMatchingScoreDto } from "./dtos/InvokeLambda.dto";

// Import enums
import { InvokeLambdaSourceTypeBulkJdResumeMatchingScoreEntityTypeEnum } from "./enums/InvokeLambda.enum";

// Import services
import { agencyUserSubmissionServiceObj } from "./services/AgencyUserSubmission.service";

// Import utils
import HttpStatusCode from './utils/http-codes.util';
import { BaseError } from './utils/errors.util';

export const handler = async (
  event: InvokeLambdaSourceTypeBulkJdResumeMatchingScoreDto,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Process bulk JD-CV match scoring logic here
    global.logger.info('Bulk JD-CV match score processing started', {
      event,
    });

    switch (event.entityType) {
      case InvokeLambdaSourceTypeBulkJdResumeMatchingScoreEntityTypeEnum.AGENCY_USER_SUBMISSION_FIND_MATCH_SCORE_BULK_JD_RESUME:
         if(!event.agencyUserSubmissionFindMatchScoreBulkJdResume) {
            global.logger.error('agencyUserSubmissionIds is required', {
               event,
            });
            throw new BaseError(`"agencyUserSubmissionFindMatchScoreBulkJdResume" is required`, HttpStatusCode.BAD_REQUEST_400);
         }
         const bulkMatchingScoreResult: boolean = await agencyUserSubmissionServiceObj.bulkFindMatchingScoreAgencyUserSubmission(
            event.agencyUserSubmissionFindMatchScoreBulkJdResume
         );

         if(!bulkMatchingScoreResult) {
            global.logger.error('Bulk JD-CV match score processing failed', {
               event,
            });
            throw new BaseError('Bulk JD-CV match score processing failed', HttpStatusCode.INTERNAL_SERVER_ERROR_500);
         }

         global.logger.info('Bulk JD-CV match score processing completed', {
            event,
            bulkMatchingScoreResult
         });

         break;
    
      default:
         break;
    }
    
    return {
      statusCode: HttpStatusCode.OK_200,
      body: JSON.stringify({
        message: "Bulk JD-CV match score processing completed",
      }),
    };
  } catch (error) {
    global.logger.error('Error in bulk JD-CV match score processing:', error);
    
    return {
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};