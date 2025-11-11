// import aws lambda related types
import { APIGatewayProxyResult } from "aws-lambda";

// import constants and configs
import { awsClientLambdaLibrary } from "../configs/aws-sdk.config";
import APP_CONSTANTS from "../configs/constants.config";

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
}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();
