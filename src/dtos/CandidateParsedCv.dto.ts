
// Import dtos
import { CommonPhoneNumberDto } from "./Common.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

export interface CandidateParsedCvDbPhoneNumberDto extends CommonPhoneNumberDto {}

export interface CandidateParsedCvCorporateListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
   companyId: string;
   jobId?: string;
   currentCompany?: string;
   currentDesignation?: string;
   totalYOE?: number;
   relevantYOE?: number;
   currentCTC?: number;
   expectedCTC?: number;
   noticePeriod?: number;
   location?: string;
   readyToRelocate?: boolean;
   isNoticePeriodNegotiable?: boolean;
}

export interface CandidateParsedCvCorporateListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
   companyId: string;
   jobId?: string;
   currentCompany?: string;
   currentDesignation?: string;
   totalYOE?: number;
   relevantYOE?: number;
   currentCTC?: number;
   expectedCTC?: number;
   noticePeriod?: number;
   location?: string;
   readyToRelocate?: boolean;
   isNoticePeriodNegotiable?: boolean;
}