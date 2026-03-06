export interface EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  instagramUrl: string;
  instagramLogoUrl: string;
  linkedInUrl: string;
  linkedInLogoUrl: string;
  workoLogoUrl: string;
}

export interface EmailTemplatePlaceholderAGENCY_INVITE_FOR_REGISTERED extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
   agencyUserName: string;
   agencyLoginUrl: string;
}

export interface EmailTemplatePlaceholderAGENCY_INVITE_FOR_UNREGISTERED extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  agencyUserName: string;
  companyName: string;
  agencySignupUrl: string;
}

export interface EmailTemplatePlaceholderCAND_ACCOUNT_CHANGE_PASS_SIGNUP_REMINDER extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  companyName: string;
  candidateLoginUrl: string;
  candidateTemporaryPassword: string;
}

export interface EmailTemplatePlaceholderCAND_SUCCESS_SUBMIT_FORM_FOR_JOB extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  dateApplied: string;
}

export interface EmailTemplatePlaceholderCAND_DUPLICATE_JOB_APPLICATION_SUBMIT_FORM_FOR_JOB extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  dateApplied: string;
}

/**
 * @note
 *  1. Below will be used if we want to send email to candidates for agency bulk cv check
 */
/*
export interface EmailTemplatePlaceholderCAND_AGENCY_BULK_JD_RESUME_HIGH_MATCHING_SCORE extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  matchingScore: number;
  signUpUrl: string;
}

export interface EmailTemplatePlaceholderCAND_AGENCY_BULK_JD_RESUME_LOW_MATCHING_SCORE extends EmailTemplatePlaceholderSOCIAL_PROFILE_DETAILS {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  signUpUrl: string;
}
*/