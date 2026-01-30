
// Import enums
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";
import { InvokeLambdaHandlerEventTypeEnum } from "../enums/InvokeLambda.enum";

export interface InvokeLambdaParseAgencyUserSubmissionCandidateCvDto {
  agencyUserId: string;
  companyId: string;
  jobId: string;
  candidateParsedCvAwsS3FileName: string;
}

export interface InvokeLambdaSourceTypeJdResumeMatchingScoreDto {
  /**
   * @description
   *  1. This will be only available whenever find matching score happens from `search in database` page 
   *  of `corporate` dashboard
   *  2. Using this id `ai team` will update matching score details in `candidateJobMatchings` collection
   * 
   * @reference `id` attribute of `CandidateJobMatching.model.ts`
   */
  candidateJobMatchingId?: string;

  /**
   * @reference "id" attribute of "AgencyUserSubmission.model.ts"
   * @note This is required if "sourceType" is "AGENCY_SUBMIT_USER_CV"
   */
  agencyUserSubmissionId?: string;

  actionByCorporateUserId?: string;

  actionByUserId?: string;

  /**
   * @reference The "id" attribute of the "CompanyJob.model.ts" from AWS DynamoDB
   */
  jobId: string;

  cvAwsS3ResourceType: CandidateParsedCvAwsS3ResourceTypeEnum;

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

export interface InvokeLambdaHandlerEventPayloadDto {
  eventType: InvokeLambdaHandlerEventTypeEnum;
  data: unknown;
}

export interface InvokeLambdaCandidateBulkMoveToApplicantDto {
  candidateParsedCvId: string; // "01KCV1XNZNQ2Z6QWVB5A745G8N";
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
  jobId: string; // "01KATYAQFJNNG73FMWEF4P8YJP";
  companyName: string; // "NELLSYS";
  jobTitle: string; // "three full stack developer (react.js | node.js | aws)";
  cognitoUserGroups: string[];
  actionByUserId?: string,
  actionByCorporateUserId?: string
}