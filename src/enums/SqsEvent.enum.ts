

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
  CORPORATE_CAND_PROFILE_REFERRAL_SOURCE = "CORPORATE_CAND_PROFILE_REFERRAL_SOURCE"
}