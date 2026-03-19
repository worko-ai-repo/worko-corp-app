// Import dtos
import { CommonPhoneNumberDto } from "./Common.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

// Import enums
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";
import { BulkSourceTypeParseResumeStatusEnum } from "../enums/BulkSourceTypeParseResume.enum";

export interface CentralCandidateProfileDbPhoneNumberDto extends CommonPhoneNumberDto {}

export interface CentralCandidateProfileListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
 refereeType?: CentralCandidateProfileDbRefereeTypeEnum;
 includeCandidateParsedCvDetails?: boolean;
 companyName?: string;
}

export interface CentralCandidateProfileListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
 refereeType?: CentralCandidateProfileDbRefereeTypeEnum;
 includeCandidateParsedCvDetails?: boolean;
 companyName?: string;
}

export interface CentralCandidateProfileBulkCvPsuToUploadApiDto {
  bulkCvs: {
    fileName: string; // "sample-cv.pdf"
    fileMimeType: string; // "application/pdf"
    bulkSourceTypeParseResumeStatus?: BulkSourceTypeParseResumeStatusEnum;
  }[];
  /**
   * @reference "id" field of "BulkSourceTypeResume.model.ts
   */
  bulkSourceTypeResumeId: string;
}