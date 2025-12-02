
// Import dtos
import { AgencyUserSubmissionBulkFindMatchingScoreInternalDto } from "./AgencyUserSubmission.dto";

// Import enums
import { InvokeLambdaSourceTypeBulkJdResumeMatchingScoreEntityTypeEnum } from "../enums/InvokeLambda.enum";

export interface InvokeLambdParseAgencyUserSubmissionCandidateCvDto {
  agencyUserId: string;
  companyId: string;
  jobId: string;
  candidateParsedCvAwsS3FileName: string;
}

export interface InvokeLambdaSourceTypeJdResumeMatchingScoreDto {
  /**
   * @reference The "id" attribute of the "CompanyJob.model.ts" from AWS DynamoDB
   */
  jobId: string;

  /**
   * @example
   *  In dev environment
   *    1. "worko-app-dev"
   *    2. "worko-corporate-dev"
   *  In prod environment
   *    1. "worko-app-prod"
   *    2. "worko-corporate-prod"
   */
  cvAwsS3BucketName: string;

  /**
   * @example
   *  1. "/agencies/{agencyUserId}/companies/{companyId}/jobs/{jobId}/user-profiles"
   *  2. "/users/{userId}/resumes"
   *  3. "/companies/{companyId}/bulk-cvs/{corporateBulkJdId}"
   */
  cvAwsS3FilePath: string;

  /**
   * @description
   *  1. Name of the aws s3 file
   *
   * @example "01K8TPT1PT2W5DTRSFPWTB92GH.pdf"
   */
  cvAwsS3FileName?: string;

  /**
   * @description
   *  1. If "cvAwsS3FilePath" is "/users/{userId}/resumes" then this will be used.
   * @example "USR#EML#shaukt1998+29@gmail.com"
   */
  USER_PK?: string;
}

export interface InvokeLambdaSourceTypeBulkJdResumeMatchingScoreDto {
  entityType: InvokeLambdaSourceTypeBulkJdResumeMatchingScoreEntityTypeEnum;

  /**
   * @description
   *  1. Whenever "entityType" is "AGENCY_USER_SUBMISSION_FIND_MATCH_SCORE_BULK_JD_RESUME"
   */
  agencyUserSubmissionFindMatchScoreBulkJdResume?: AgencyUserSubmissionBulkFindMatchingScoreInternalDto;
}