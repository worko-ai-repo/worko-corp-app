// import aws lambda related types
import { APIGatewayProxyResult } from "aws-lambda";

// import constants and configs
import { awsClientLambdaLibrary } from "../configs/aws-sdk.config";
import APP_CONSTANTS from "../configs/constants.config";

// import dtos
import { InvokeLambdaSourceTypeJdResumeMatchingScoreDto, InvokeLambdaParseAgencyUserSubmissionCandidateCvDto, InvokeLambdaHandlerEventPayloadDto, InvokeLambdaParseSubmitFormCandidateParsedCvDto, InvokeLambdaRefreshCandidateParsedCvDto, InvokeLambdMatchingScoreCalcualtionDto } from "../dtos/InvokeLambda.dto";

// import enums
import { InvocationTypeEnum } from "../enums/InvokeLambda.enum";

// import utils
import { BaseError } from "../utils/errors.util";

/**
 * @note
 *  1. using `APIGatewayProxyResult` as return type is not a valid for all lambda function invoke result.
 *  2. As of now the return structure is same as APIGatewayProxyResult, so we are using it as return type.
 *  3. Usually we use `Promise<APIGatewayProxyResult>` as return type for only when Api gateway is used to trigger lambda function.
 */
class InvokeLambdaService {
  async triggerParseAgencyUserSubmissionCandidateCv(
    payload: InvokeLambdaParseAgencyUserSubmissionCandidateCvDto
  ): Promise<APIGatewayProxyResult> {
    // log the info
    global.logger.info(
      "Parse Agency User Submission Candidate CV Lambda [service]",
      {
        methodName: this.triggerParseAgencyUserSubmissionCandidateCv.name,
      }
    );

    return awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType<InvokeLambdaParseAgencyUserSubmissionCandidateCvDto>(
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

  async triggerWorkoCorpAppInvokeLambdaTrigger(
    payload: InvokeLambdaHandlerEventPayloadDto
  ) {
    return awsClientLambdaLibrary.triggerLambdaEventInvocationType(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.WORKO_CORP_APP_INVOKE_LAMBDA_NAME,
      payload
    );
  }

  async triggerWorkoJobAppInvokeLambdaTrigger(
    awsLambdaInvocationType: InvocationTypeEnum,
    payload: InvokeLambdaHandlerEventPayloadDto
  ) {
    switch (awsLambdaInvocationType) {
      case InvocationTypeEnum.EventType:
        return awsClientLambdaLibrary.triggerLambdaEventInvocationType(
          APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.WORKO_JOB_APP_INVOKE_LAMBDA_NAME,
          payload,
        );

      case InvocationTypeEnum.RequestResponseType:
        return awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType(
          APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.WORKO_JOB_APP_INVOKE_LAMBDA_NAME,
          payload,
        );

      case InvocationTypeEnum.DryRunType:
        global.logger.error("DryRunType not supported as of now we may implement it in near future if needed.", {
          methodName: this.triggerWorkoJobAppInvokeLambdaTrigger.name,
        });
        throw new BaseError("DryRunType not supported as of now, we may implement it in near future if needed.");

      default:
        global.logger.error("Invalid Invocation Type", {
          methodName: this.triggerWorkoJobAppInvokeLambdaTrigger.name,
        });
        throw new BaseError("Invalid Invocation Type");
    }
  }

  async triggerParseSubmitFormCandidateParsedCv(payload: InvokeLambdaParseSubmitFormCandidateParsedCvDto) {
    return awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType<InvokeLambdaParseSubmitFormCandidateParsedCvDto>(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.RESUME_EXTRACTION_LAMBDA_NAME,
      payload
    );
  }

  async triggerRefreshCandidateParsedCv(payload: InvokeLambdaRefreshCandidateParsedCvDto) {
    return awsClientLambdaLibrary.triggerLambdaRequestResponseInvocationType<InvokeLambdaRefreshCandidateParsedCvDto>(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.RESUME_EXTRACTION_LAMBDA_NAME,
      payload,
    );
  }

  async triggerMatchingScoreCalculation(
    payload: InvokeLambdMatchingScoreCalcualtionDto
  ): Promise<APIGatewayProxyResult> {
    global.logger.info("Trigger Matching Score Calculation [service]", {
      methodName: this.triggerMatchingScoreCalculation.name,
    });

    // Trigger Lambda
    return awsClientLambdaLibrary.triggerLambdaEventInvocationType<InvokeLambdMatchingScoreCalcualtionDto>(
      APP_CONSTANTS.LAMBDA_FUNCTION_NAMES.MATCHING_SCORE_LAMBDA_NAME,
      payload
    );
  }
}

// Export an instance of the InvokeLambda class
export default new InvokeLambdaService();
