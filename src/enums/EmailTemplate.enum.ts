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
}
