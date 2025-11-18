// Import dtos
import { CommonPhoneNumberDto } from "./Common.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

// Import enums
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";

export interface CentralCandidateProfileDbPhoneNumberDto extends CommonPhoneNumberDto {}

export interface CentralCandidateProfileListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
 refereeType?: CentralCandidateProfileDbRefereeTypeEnum;
 candidateEmail?: string;
 includeCandidateParsedCvDetails?: boolean;
}

export interface CentralCandidateProfileListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
 refereeType?: CentralCandidateProfileDbRefereeTypeEnum;
 candidateEmail?: string;
 includeCandidateParsedCvDetails?: boolean;
}