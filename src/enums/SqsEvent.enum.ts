

export enum SqsMsgEventEnum {
  /**
   * @description
   *    1. Whenever a `corporate` uploads bulk candidate cv's against his particular `company`
   *    the cv will be get parsed in `worko-cand-profile-parser-dev` lambda and all the details will be
   *    sent in this sqs event
   */
  CORPORATE_CAND_PROFILE_BULK_UPLOAD = "CORPORATE_CAND_PROFILE_BULK_UPLOAD",

  /**
   * @description
   *    1. Whenever a `worko-admin` uploads bulk candidate cv's
   *    the cv will be get parsed in `worko-cand-profile-parser-dev` lambda and all the details will be
   *    sent in this sqs event
   */
  ADMIN_CAND_PROFILE_BULK_UPLOAD = "ADMIN_CAND_PROFILE_BULK_UPLOAD",

  /**
   * @description
   *    1. Whenever "corporate-admin" submits a referral email and whatever cvs recieved to that email will be parsed and this event will be triggered
   */
  CORPORATE_CAND_PROFILE_REFERRAL_SOURCE = "CORPORATE_CAND_PROFILE_REFERRAL_SOURCE",

  /**
   * @description
   *    1. Whenever an `agency` upload `bulk candidate's cv` for particular `companyJob` or `job description`
   *    the cv-jd matching score will be calculated in `worko-agency-bulk-jd-resume-matching-dev` lambda and all this event will be triggered for successfully 
   *    calculated matching score. 
   */
  AGENCY_BULK_JD_RESUME_POST_MATCHING_SCORE = "AGENCY_BULK_JD_RESUME_POST_MATCHING_SCORE",

  /**
   * @description
   *    1. Whenever a `corporate` uploads bulk candidate cv's against his particular `company`
   *    the cv will be get parsed in `worko-cand-profile-parser-dev` lambda and duplicacy will be checked,
   *    if duplicate found and the cv is `3` months old then this event will be triggered to update that cv
   */
  OLDER_CV_CORPORATE_CAND_PROFILE_BULK_UPLOAD = "OLDER_CV_CORPORATE_CAND_PROFILE_BULK_UPLOAD",

  /**
   * @description
   *    1. Whenever a `worko-admin` uploads bulk candidate cv's
   *    the cv will be get parsed in `worko-cand-profile-parser-dev` lambda and duplicacy will be checked,
   *    if duplicate found and the cv is `3` months old then this event will be triggered to update that cv
   */
  OLDER_CV_ADMIN_CAND_PROFILE_BULK_UPLOAD = "OLDER_CV_ADMIN_CAND_PROFILE_BULK_UPLOAD",
}