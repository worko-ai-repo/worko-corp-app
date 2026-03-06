/**
 * EmailTemplateStatus
 *
 * Description: Enum representing the possible statuses of a Email Template.
 */
export enum EmailTemplateStatusEnum {
  ENABLED = "ENABLED",
  DISABLED = "DISABLED",
}

export enum EmailTemplateEnum {
  /**
   * AGENCY_INVITE_FOR_REGISTERED
   *
   * The template name used to whenever `corporate-recruiter/admin` sends an invite to a user and if the user already have an agency account at `worko` then this email will be sent to that user.
   */
  AGENCY_INVITE_FOR_REGISTERED = "AGENCY_INVITE_FOR_REGISTERED",

  /**
   * AGENCY_INVITE_FOR_UNREGISTERED
   *
   * The template name used to whenever `corporate-recruiter/admin` sends an invite to a user and if the user does not have an agency account at `worko` then this email will be sent to that user.
   */
  AGENCY_INVITE_FOR_UNREGISTERED = "AGENCY_INVITE_FOR_UNREGISTERED",

  /**
   * CAND_ACCOUNT_CHANGE_PASS_SIGNUP_REMINDER
   *
   * @description
   *    1. The template is used whenever the agency submits a unregistered candidate for a job,
   *       if `corporate-recruiter/admin` or `worko-admin` moves the candidate to applicant then
   *       we are creating his account from backend with temporary password and the email,temporary
   *       password will be sent to the candidate as reminder message.
   */
  CAND_ACCOUNT_CHANGE_PASS_SIGNUP_REMINDER = "CAND_ACCOUNT_CHANGE_PASS_SIGNUP_REMINDER",

  CAND_SUCCESS_SUBMIT_FORM_FOR_JOB = "CAND_SUCCESS_SUBMIT_FORM_FOR_JOB",

  CAND_DUPLICATE_JOB_APPLICATION_SUBMIT_FORM_FOR_JOB = "CAND_DUPLICATE_JOB_APPLICATION_SUBMIT_FORM_FOR_JOB",
}
