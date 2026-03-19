/**
 * InvocationTypeEnum
 *
 * Enum representing the type of invocation of a Lambda function.
 *
 * API Reference Invoke Lambda Documentation:
 * @see https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html
 */
export enum InvocationTypeEnum {
  /**
   * RequestResponseType
   *
   * RequestResponse (default) – Invoke the function synchronously.
   * Keep the connection open until the function returns a response or times out.
   * The API response includes the function response and additional data.
   *
   * For the `RequestResponse` invocation type, this status code is 200.
   */
  RequestResponseType = "RequestResponse",

  /**
   * EventType
   *
   * Event – Invoke the function asynchronously.
   * Send events that fail multiple times to the function's dead-letter queue (if one is configured).
   * The API response only includes a status code.
   *
   * For the `Event` invocation type, this status code is 202.
   */
  EventType = "Event",

  /**
   * DryRunType
   *
   * DryRun – Validate parameter values and verify that the user or role has permission to invoke the function.
   *
   * For the `DryRun` invocation type, the status code is 204.
   */
  DryRunType = "DryRun",
}

/**
 * InvokeLambdaHandlerEventTypeEnum
 */
export enum InvokeLambdaHandlerEventTypeEnum {
  CANDIDATE_BULK_MOVE_TO_APPLICANT = "CANDIDATE_BULK_MOVE_TO_APPLICANT",
  AGENCY_USER_SUBMISSION_BULK_MOVE_TO_APPLICANT = "AGENCY_USER_SUBMISSION_BULK_MOVE_TO_APPLICANT",
  AGENCY_USER_SUBMISSION_BULK_REJECT_APPLICANT = "AGENCY_USER_SUBMISSION_BULK_REJECT_APPLICANT",
  AGENCY_USER_SUBMISSION_BULK_SEND_FOR_EVALUATION_MOVE_TO_APPLICANT = "AGENCY_USER_SUBMISSION_BULK_SEND_FOR_EVALUATION_MOVE_TO_APPLICANT",
  CANDIDATE_SUBMIT_CV_FOR_JOB = "CANDIDATE_SUBMIT_CV_FOR_JOB",
  REFRESH_CANDIDATE_PARSED_CV = "REFRESH_CANDIDATE_PARSED_CV",

  /**
   * @note
   *  This is event in `worko-job-app` repo aws lambda
   */
  JOB_APPLICATION_VALIDATE_MATCHING_SCORE = "JOB_APPLICATION_VALIDATE_MATCHING_SCORE",

  SCRIPT_TO_ADD_CAND_NAME_IN_CORPORATE_CANDIDATE_PROFILES = "SCRIPT_TO_ADD_CAND_NAME_IN_CORPORATE_CANDIDATE_PROFILES",
  SCRIPT_TO_ADD_CAND_NAME_IN_CENTRAL_CANDIDATE_PROFILES = "SCRIPT_TO_ADD_CAND_NAME_IN_CENTRAL_CANDIDATE_PROFILES",
}

export enum SourceTypeMatchingScoreEntityEnum {
  /**
   * @description 
   *  1. Whenever we try to calculate agency submitted candidate's matching score then this source type entity will be used.
   */
  AGENCY_USER_SUBMISSION = "AGENCY_USER_SUBMISSION",

  /**
   * @description
   *  1. Whenever in "A.T.L.A.S page" the matching score will be calculated then this source type entity will be used
   */
  CANDIDATE_PARSED_CV = "CANDIDATE_PARSED_CV",
}