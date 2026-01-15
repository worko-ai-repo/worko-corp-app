// Import dtos
import { CommonPhoneNumberDto } from "./Common.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

// Import enums
import { CorporateCandidateProfileDbRefereeTypeEnum } from "../enums/CorporateCandidateProfile.enum";

export interface CorporateCandidateProfileDbPhoneNumberDto extends CommonPhoneNumberDto {}

export interface CorporateCandidateProfileListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
 refereeType?: CorporateCandidateProfileDbRefereeTypeEnum;
 companyId?: string;
 candidateEmail?: string;
 includeCandidateParsedCvDetails?: boolean;
 includeJobDetails?: boolean;
}

export interface CorporateCandidateProfileListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
 refereeType: CorporateCandidateProfileDbRefereeTypeEnum;
 companyId?: string;
 candidateEmail?: string;
 includeCandidateParsedCvDetails?: boolean;
 includeJobDetails?: boolean;
}

export interface CorporateCandidateProfileDuplicationRequestDTO {
   companyId: string,
   candidateEmailId: string,
   phoneNumber: number, // 9666308100
   phoneCountryCode: number // 91
}

export interface CorporateCandidateProfileBulkCvPsuToUploadApiDto {
   /**
    * @description
    *  1. Must be company id of registered corporate user
    */
   companyId: string,

   bulkCvs: {
      fileName: string, // "sample-cv.pdf"
      fileMimeType: string // "application/pdf"
   }[]
}