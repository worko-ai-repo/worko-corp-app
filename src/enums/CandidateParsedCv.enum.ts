export enum CandidateParsedCvAwsS3ResourceTypeEnum {
  /**
   * @description
   *  1. `Corporate-recruiter/admin` assign jobs to "Registered agency users" and if "agency" submits candidate cv for that job then
   * this resource key will be used
   *  2. Required request body: "companyId", "jobId", "agencyUserId", "candidateCvAwsS3FileName"
   */
  AGENCY_SUBMIT_USER_CV = "AGENCY_SUBMIT_USER_CV",

  /**
   * @description
   *  1. Cv of a registered user
   *  2. Required params: "cognitoUserId", "cloudFileName"
   */
  USER_RESUME = "USER_RESUME",

  /**
   * @description
   *  1. Cv of a user when bulk screening
   *  2. Required params: "companyId", "cloudFileName"
   *  3. Required request body: "corporateBulkJdId"
   */
  BULK_CVS = "BULK_CVS",

  /**
   * @description 
   *  1. In `My database` page of `Corporate dashboard` whenever corporate upload bulk candidate cvs.
   *  2. Required request body: "companyId", "candCvAwsS3FileName"
   */
  CORP_CAND_BULK_CV_UPLOAD = "CORP_CAND_BULK_CV_UPLOAD",

  /**
   * @description 
   *  1. Whenever "corporate-admin" submits a referral email and whatever cvs recieved to that email will be parsed and this event will be triggered.
   */
  CORP_CAND_REFERRAL_CV = "CORP_CAND_REFERRAL_CV",

  /**
   * @description
   *  1. In `My database` page of `Admin dashboard` whenever admin upload bulk candidate cvs
   *  2. Required request body: "candCvAwsS3FileName"
   */
  ADMIN_CAND_BULK_CV_UPLOAD = "ADMIN_CAND_BULK_CV_UPLOAD",

  /**
   * @description
   *  1. Corporate creates a job in `worko` platform and generates a form link for that job and create the same job
   *     in `linkedin` platform and whenever a user clicks apply button for that job, then it will opens a 
   *     form to submit cv details, and this resource key will be used to store the cv in s3 bucket
   * 
   * @reference "Amazon S3 > Buckets > worko-app-{environment}/candidate-submit-cvs/companies/{companyId}/jobs/{jobId}/cvs/<ulidId>.pdf"
   */
  CAND_SUBMIT_CV_JOB = "CAND_SUBMIT_CV_JOB",
}