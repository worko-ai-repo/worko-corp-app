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