export interface UserDetailDTO {
  name: string;
  emailList: { [key: string]: string };
  number: string;
  userType: string[];
  isEmailVerified: boolean;
  isNumberVerified: boolean;
  isSubscribed: boolean;
  referralCount: number;
  location?: string;
  about?: string;
  CTC?: number;
  ECTC?: number;
  noticePeriod?: number;
  YOE?: number;
  CV?: string;
  coverLetter?: string;
  lastAccessedDash: string;
  profileImage?: string;
  country?: string;
  isCandidateFresher: boolean;
  candidateExperience?: {
    companyId?: string;
    companyName: string;
    designation: string;
    department: string;
  };

  /**
   * isWhatsappNotificationEnabled
   *
   * This field is used to enable/disable the whatsapp notification.
   * @type {boolean}
   *
   * Note: For example, if a user logs in as an employee and wants to disable WhatsApp notifications on the employee dashboard while keeping them enabled on the candidate dashboard,
   * this `isWhatsappNotificationEnabled` setting won't work that way.
   * When `isWhatsappNotificationEnabled` is set to `false` on the employee dashboard,
   * it will also be `false` on the candidate dashboard, applying globally across all user roles.
   */
  isWhatsappNotificationEnabled?: boolean;
}

export interface UserDetailDbCandidateExperienceDto {
  companyId?: string;
  companyName: string;
  designation: string;
  department: string;
  YOE?: number;
  startDate?: string;

  /**
   * endDate
   *
   * @description if endDate is not provided or empty string, it will be considered as ongoing experience
   */
  endDate?: string;
}

export interface UserDetailCreateDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  number: string;
  linkedinUrl?: string;
  ECTC?: number;
  YOE?: number;
  CV?: string;
  emailList: { [key: string]: string };
  userType: string[];
  isEmailVerified: boolean;
  isNumberVerified: boolean;
  lastAccessedDash: string;
  referralCount: number;
  isSubscribed: boolean;
  expiryDate: Date;
  acceptedTermsAndConditions: boolean;
  /**
   * @description
   *  1. whenever the agency submits a unregistered candidate for a job and if a corporate move it to applicants page
   *     then in backend we are creating the candidate account in cognito and aws dynamodb as unverified email without sending any
   *     otp, and we will specify this as "true", and as of now this attribute is used while listing job applications and attaching applicant details
   *     to them.
   */
  isUserCreatedInternally?: boolean;
}