
// Import dtos
import { EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS } from "../dtos/EmailTemplatePlaceholder.dto";

/**
 * APP_CONSTANTS
 *
 * These are the generic constants common for all applications/services.
 * For the application/service specific constants consider respective constant config file.
 */
const APP_CONSTANTS = {
  // Application default timezone
  APP_DEFAULT_TIMEZONE: process.env.TZ ?? "GMT",

  // Application stage
  APP_SLS_STAGE: process.env.APP_SLS_STAGE,

  // The stages/environments supported by the application.
  STAGES: {
    LOCAL: "local",
    DEV: "dev",
    PROD: "prod",
  },

  /**
   * Date formates
   */
  DATE_FORMAT_BASE_ERROR_TIMESTAMP: "ddd, DD MMM YYYY HH:mm:ss z", // Date format for the "BaseError.timeStamp" class property
  MYSQL_DATE_FORMATE: "YYYY-MM-DD", // MySQL Date formates

  // This is unknow exception error message
  ERROR_MESSAGE_UNKNOWN_EXCEPTION: "Something went wrong!!!",
  ERROR_MESSAGE_REQUEST_FOR_AUTHORISED_RESOURSE_ACCESS: "",
  ERROR_MESSAGE_RESOURCE_NOT_FOUND:
    "The requested resource is not found with the provided details.",

  // The possible options for the page sizes that is expected in the request payload.
  PAGE_LENGTH_OPTIONS: [5, 10, 25, 50, 100, 150, 200, 250],

  /**
   * Signed URL expires in the given seconds.
   * Formula: {NUMBER OF MINUTES} * 60 [Unit: Seconds]
   */
  AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS: 15 * 60, // Pre-Signed url to upload the files expires in 15 minutes
  AWS_S3_SIGNED_URL_TO_VIEW_FILE_EXPIRY_IN_SECONDS: 15 * 60, // Pre-Signed url to view the files expires in 15 minutes

  AWS_S3_DIR_PATHS: {
    USER_RESUME: "users/{userId}/resumes", // To upload the individual user's resume
    USER_PROFILE_PIC: "users/{userId}/profilePics", // To upload the individual user's profile pics
    AGENCY_INVITE_CONTRACT_COPY: `companies/{companyId}/agency-invites/{agencyInviteId}/contract-copies`,
    AGENCY_SUBMIT_USER_CV: `agencies/{agencyUserId}/companies/{companyId}/jobs/{jobId}/user-profiles`,
    CAND_SUBMIT_CV_JOB: `candidate-submit-cvs/companies/{companyId}/jobs/{jobId}/cvs`,
    AGENCY_BULK_CVS: `agencies/{agencyUserId}/bulk-cvs/{agencyBulkJdId}`,

    /**
     * @description
     *  1. In `My database` page of `Corporate dashboard` whenever corporate upload bulk candidate cvs
     *  we store in this path.
     */
    CORP_CAND_BULK_CV_UPLOAD: `companies/{companyId}/bulk-cvs`,

    /**
     * @description
     *  1. Whenever "corporate-admin" submits a referral email and whatever cvs recieved to that email will be parsed and path will be used.
     */
    CORP_CAND_REFERRAL_CV: `companies/{companyId}/referral-source-cvs`,

    /**
     * @description
     *  1. In `My database` page of `Admin dashboard` whenever admin upload bulk candidate cvs 
     *  we store in this path.
     */
    ADMIN_CAND_BULK_CV_UPLOAD: `bulk-cvs`
  },

  /**
   * Cognito Identity Pool Groups
   * * ADMIN
   * * CORPORATE-ADMIN
   * * CORPORATE-RECRUITER
   */
  COGNITO_IDENTITY_POOL_GROUPS: {
    ADMIN: "admin",
    CORPORATE_ADMIN: "corporate-admin",
    CORPORATE_RECRUITER: "corporate-recruiter",
    EVALUATOR: "evaluator",
  },

  // If "pageSize" from the request does not match with one of the "PAGE_LENGTH_OPTIONS" value, then this value would be used.
  PAGE_LENGTH_DEFAULT: 10,

  LAMBDA_FUNCTION_NAMES: {
    /**
     * WORKO_JOB_APP_OPENSEARCH_OPERATIONS
     *
     * This lambda function is used to perform opensearch operations
     * This is VPC attached lambda which is used to communicate with VPC-attached OpenSearch
     */
    WORKO_JOB_APP_OPENSEARCH_OPERATIONS: `worko-job-app-${process.env.APP_SLS_STAGE}-app-opensearch-operations`,

    /**
     * @description
     *  1. In lambda name "sourceType" means candidate came to worko system through which source type.
     *  2. Sourcetype can be "Referral", "Internal", "Worko", "Agency"
     */
    WORKO_SOURCE_TYPE_JD_RESUME_MATCHING_SCORE: `worko-sourcetype-jd-resume-matching-${process.env.APP_SLS_STAGE}`,

    /**
     * RESUME_EXTRACTION_LAMBDA_NAME
     */
    RESUME_EXTRACTION_LAMBDA_NAME: `worko-resume-parser-${process.env.APP_STAGE}`,

    /**
     * @description This lambda is used to invoke other lambda functions in `worko-corp-app` repository
     * you can check in `appInvokeLambda` function in `serverless.ts` file 
     */
    WORKO_CORP_APP_INVOKE_LAMBDA_NAME: `worko-corp-${process.env.APP_STAGE}-appInvokeLambda`,
  },

  CASUAL_EMAIL_DOMAINS: [
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "live.com",
    "icloud.com",
    "aol.com",
    "protonmail.com",
    "zoho.com",
    "mail.com",
    "gmx.com",
  ],

  FRONTEND_ORIGINS: {
    PROD: [
      "https://worko.ai",
      "https://agency.worko.ai",
    ],
    DEV: [
      "https://dev-ui.worko.work",
      "https://dev.worko.work",
      "https://agency.worko.work",
      "http://localhost:4200",
      "http://localhost:8080",
      "http://localhost:3001",
      "http://localhost:3002",
    ],
  },

  FRONTEND_URLS: {
    WORKO_SIGNUP_URL: `${process.env.APP_WORKO_FRONTEND_BASE_URL}/auth/signup`,
    WORKO_LOGIN_URL: `${process.env.APP_WORKO_FRONTEND_BASE_URL}/auth/login`,

    WORKO_AGENCY_LOGIN_URL: `${process.env.APP_WORKO_AGENCY_FRONTEND_BASE_URL}/auth/agency/login`,

    /**
     * @example "https://agency.worko.work/auth/agency/signup/01KA0Z4YZF598N7WA3ETMEWAV6"
     */
    WORKO_AGENCY_SIGNUP_URL: `${process.env.APP_WORKO_AGENCY_FRONTEND_BASE_URL}/auth/agency/signup/{agencyUserInviteId}`,
  },

  MATCHING_SCORES: {
    AGENCY_BULK_JD_RESUME_MINIMUM_MATCHING_SCORE: 70,
  },

  SOURCE_EMAIL_ADDRESS: {
    WORKO_DEFAULT: {
      email: "hello@worko.ai",
      fullName: "Worko.ai",
    },
    WORKO_NO_REPLY: {
      email: "no-reply@worko.ai",
      fullName: "Worko.ai",
    },
  },

  WORKO_SOCIAL_PROFILE_DETAILS: {
    INSTAGRAM: {
      URL: process.env.APP_WORKO_SOCIAL_PROFILE_INSTAGRAM_URL,
      LOGO_URL: process.env.APP_WORKO_SOCIAL_PROFILE_INSTAGRAM_LOGO_URL,
    },
    LINKEDIN: {
      URL: process.env.APP_WORKO_SOCIAL_PROFILE_LINKEDIN_URL,
      LOGO_URL: process.env.APP_WORKO_SOCIAL_PROFILE_LINKEDIN_LOGO_URL,
    },
  },

  get GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL(): EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
    const { INSTAGRAM, LINKEDIN } = this.WORKO_SOCIAL_PROFILE_DETAILS;
    const { LOGO_URL: instagramLogoUrl, URL: instagramUrl } = INSTAGRAM;
    const { LOGO_URL: linkedInLogoUrl, URL: linkedInUrl } = LINKEDIN;

    const socialProfielForEmails: EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS =
      {
        workoLogoUrl:
          this.WORKO_LOGO_URL ??
          "https://worko.ai/assets/logo-text-Dfe5k43I.webp",
        instagramUrl: instagramUrl ?? "https://instagram.com/worko_ai",
        instagramLogoUrl:
          instagramLogoUrl ??
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png",
        linkedInUrl: linkedInUrl ?? "https://www.linkedin.com/company/worko",
        linkedInLogoUrl:
          linkedInLogoUrl ??
          "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/600px-LinkedIn_logo_initials.png",
      };

    return socialProfielForEmails;
  },

  /**
   * @todo: If not signup we will send 8 reminders, Days: 1-3-5-9-12-18-21-30
   */
  get CAND_CHANGE_PASS_SIGNUP_REMINDER_DELAY(): number {
    return process.env.APP_SLS_STAGE === APP_CONSTANTS.STAGES.PROD
      ? 3 * 24 * 60 * 60 * 1000 // 3 days in milliseconds
      // : 5 * 60 * 1000; // 5 minutes in milliseconds 
      : 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  },

  WORKO_LOGO_URL: process.env.APP_WORKO_LOGO_URL,
};

export default APP_CONSTANTS;
