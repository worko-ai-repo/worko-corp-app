
/**
 * FileResourceKeyEnum
 */
export enum FileResourceKeyEnum {
  /**
   * @description While sending agency user invite by corporate-recruiter/admin then `Contract copy` will be attached.
   */
  AGENCY_INVITE_CONTRACT_COPY = "AGENCY_INVITE_CONTRACT_COPY",

  /**
   * @description `Corporate-recruiter/admin` assign jobs to "Registered agency users" and if "agency" submits candidate cv for that job then
   * this resource key will be used
   */
  AGENCY_SUBMIT_USER_CV = "AGENCY_SUBMIT_USER_CV",

  AGENCY_BULK_CVS = "AGENCY_BULK_CVS",

  /**
   * @description
   *  1. In `My database` page of `Corporate dashboard` whenever corporate upload bulk candidate cvs.
   */
  CORP_CAND_BULK_CV_UPLOAD = "CORP_CAND_BULK_CV_UPLOAD",

  /**
   * @description
   *  1. Whenever "corporate-admin" submits a referral email and whatever cvs recieved to that email will be parsed and path will be used.
   */
  CORP_CAND_REFERRAL_CV = "CORP_CAND_REFERRAL_CV",

  /**
   * @description
   *  1. In `My database` page of `Admin dashboard` whenever admin upload bulk candidate cvs
   */
  ADMIN_CAND_BULK_CV_UPLOAD = "ADMIN_CAND_BULK_CV_UPLOAD",
}
