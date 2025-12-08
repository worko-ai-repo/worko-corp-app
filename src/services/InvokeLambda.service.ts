// import aws lambda related types
import { APIGatewayProxyResult } from "aws-lambda";

// import constants and configs
import { awsClientLambdaLibrary } from "../configs/aws-sdk.config";
import APP_CONSTANTS from "../configs/constants.config";

// import dtos
import { InvokeLambdaSourceTypeJdResumeMatchingScoreDto, InvokeLambdParseAgencyUserSubmissionCandidateCvDto } from "../dtos/InvokeLambda.dto";

class InvokeLambdaService {
  /**
   * triggerOpenSearchOperation
   *
   * Triggers an AWS Lambda function to perform operations on an OpenSearch
   * cluster. This method sends a payload to the Lambda function specified
   * in the configuration and handles the response.
   *
   * @param {OpensearchPayload} payload - The payload containing details of the
   * OpenSearch operation to be performed.
   * @returns {Promise<APIGatewayProxyResult>} The response object containing
   * the status code and message indicating the success or failure of the
   * operation.
   */
  async triggerOpenSearchOperation<OpensearchPayload>(
    payload: OpensearchPayload
  ): Promise<APIGatewayProxyResult> {
    // log the info
    global.logger.info("Trigger OpenSearch Operation Lambda [service]", {
      methodName: this.triggerOpenSearchOperation.name,
    });

    return awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType<OpensearchPayload>(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.WORKO_JOB_APP_OPENSEARCH_OPERATIONS,
      payload
    );
  }

  async triggerParseAgencyUserSubmissionCandidateCv(
    payload: InvokeLambdParseAgencyUserSubmissionCandidateCvDto
  ): Promise<APIGatewayProxyResult> {
    // log the info
    global.logger.info(
      "Parse Agency User Submission Candidate CV Lambda [service]",
      {
        methodName: this.triggerParseAgencyUserSubmissionCandidateCv.name,
      }
    );

    return awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType<InvokeLambdParseAgencyUserSubmissionCandidateCvDto>(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.RESUME_EXTRACTION_LAMBDA_NAME,
      payload
    );
  }

  async triggerSourceTypeJdResumeMatchingScore(payload: InvokeLambdaSourceTypeJdResumeMatchingScoreDto): Promise<APIGatewayProxyResult> {
    global.logger.info("Trigger Source Type JD Resume Matching Score Lambda [service]", { methodName: this.triggerSourceTypeJdResumeMatchingScore.name });
    return awsClientLambdaLibrary.triggerLambdaEventInvocationType<InvokeLambdaSourceTypeJdResumeMatchingScoreDto>(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.WORKO_SOURCE_TYPE_JD_RESUME_MATCHING_SCORE,
      payload
    );
  }
}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();
