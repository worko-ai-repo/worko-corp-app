// Import dtos
import { CandidateParsedCvDbPhoneNumberDto } from "../../dtos/CandidateParsedCv.dto";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbCandidateParsedCvDto extends BaseFirestoreModel {
  name: string;
  email: string;
  phoneNumberDetails: CandidateParsedCvDbPhoneNumberDto;
  currentCompany?: string;
  currentDesignation?: string;
  totalYOE?: number;
  relevantYOE?: number;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
  location?: string;
  readyToRelocate?: boolean;
  cvAwsS3FileName?: string;
  isNoticePeriodNegotiable?: boolean;
  coreSkills?: string[];
  technicalSkills?: string[];
  userPreferredDepartments?: string[];
  userPreferredIndustries?: string[];
  userPreferredlocations?: string[];
  userPreferredRoles?: string[];

  /**
   * @reference The "id" field of "AgencyUserSubmission.model.ts" collection
   * @description Whenever "agency" uploads "candidate's cv" for particular "companyJob"
   */
  agencyUserSubmissionId?: string;

  /**
   * @reference "id" field of "AgencyUser.model.ts"
   * @description
   *  1. The registered agency user who submitted the "candidate profile"
   *  2. Whenever "agency" uploads "candidate's cv" for particular "companyJob"
   */
  agencyUserId?: string;

  /**
   * @reference "email" field of "AgencyUser.model.ts"
   * @description
   *  1. The registered agency user who submitted the "candidate profile"
   *  2. Whenever "agency" uploads "candidate's cv" for particular "companyJob"
   */
  agencyRegisteredEmail?: string;

  /**
   * @description
   *  1. Whenever "agency" uploads "candidate's cv" for particular "companyJob"
   */
  companyId?: string;

  /**
   * @description
   *  1. If "candidate" comes from a specific "company" then "corporateCandidateProfileId" will be the "id" field of "CorporateCandidateProfile.model.ts"
   */
  corporateCandidateProfileId?: string;

  /**
   * @description
   *  1. Whenever "agency" uploads "candidate's cv" for particular "companyJob"
   */
  jobId?: string;

  /**
   * @description
   *  1. If "candidate" is already registered then "userDetailId" will be the "id" field of "UserDetail.model.ts
   */
  userDetailId?: string;
}

export { DbCandidateParsedCvDto };
