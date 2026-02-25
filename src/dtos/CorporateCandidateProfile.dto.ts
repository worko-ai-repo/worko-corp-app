// Import dtos
import { CommonPhoneNumberDto } from "./Common.dto";
import {
  GcpFirestoreRecordListingFilterOptions,
  GcpFirestoreRecordListingFilterRequestDTO,
} from "./Common.gcp-firestore.dto";

// Import enums
import { CorporateCandidateProfileDbRefereeTypeEnum } from "../enums/CorporateCandidateProfile.enum";
import { HiringEligibilityStatusEnum } from "../enums/Common.enum";

export interface CorporateCandidateProfileDbPhoneNumberDto extends CommonPhoneNumberDto {}

export interface CorporateCandidateProfileListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
 refereeType?: CorporateCandidateProfileDbRefereeTypeEnum;
 hiringEligibilityStatus?: HiringEligibilityStatusEnum;
 companyId: string;
 candidateEmail?: string;
 includeCandidateParsedCvDetails?: boolean;
 includeJobDetails?: boolean;
}

export interface CorporateCandidateProfileListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
 refereeType?: CorporateCandidateProfileDbRefereeTypeEnum;
 hiringEligibilityStatus?: HiringEligibilityStatusEnum;
 companyId: string;
 candidateEmail?: string;
 includeCandidateParsedCvDetails?: boolean;
 includeJobDetails?: boolean;
}

export interface CorporateCandidateProfileDuplicationRequestDTO {
  companyId: string;
  candidateEmailId: string;
  phoneNumber: number; // 9666308100
  phoneCountryCode: number; // 91
}

export interface CorporateCandidateProfileBulkCvPsuToUploadApiDto {
  /**
   * @description
   *  1. Must be company id of registered corporate user
   */
  companyId: string;

  bulkCvs: {
    fileName: string; // "sample-cv.pdf"
    fileMimeType: string; // "application/pdf"
  }[];

  /**
   * @reference "id" field of "BulkSourceTypeResume.model.ts
   */
  bulkSourceTypeResumeId: string;
}

export interface CorporateCandidateProfileBlacklistBulkApiDTO {
   /**
    * @example "This candidate certificates are fake."
    */
   reasonForBlacklisting: string;
   detailedReasonForBlacklisting?: string;

  /**
   * @reference "id" fields of "CorporateCandidateProfile.model.ts"
   */
  corporateCandidateProfileIds: string[];
}

export interface CorporateCandidateProfileDbUnderCoolingPeriodDto {
  /**
   * @example "2022-01-01T00:00:00.000Z"
   * @description
   *  1. Start date of the cooling period
   */
  startDate: string;

  /**
   * @example "2022-01-01T00:00:00.000Z"
   * @description
   *  1. End date of the cooling period
   */
  endDate: string;

  /**
   * @description
   *  1. This attribute is just stored whenever a candidate is rejected after interview,
   *     we set few months delay in the cooling period for the candidate, and this schedule
   *     job will trigger and remove candidate from cooling period and mark candidate as 
   *     "ACTIVE" hiringEligibilityStatus, so that candidate can apply for other jobs in that particular company.
   * @reference
   *  1. `id` attribute of `ScheduleJob.model.ts`
   *  2. `Schedule name` in [Amazon EventBridge > Scheduler > Schedules > Schedule name]
   */
  scheduledJobId: string;

  /**
   * @description
   *  1. This cooling period started because of this job application is rejected
   * @reference 
   *  1. `id` attribute of `UserJobApplication.model.ts`
   */
  userJobApplicationId: string;
}