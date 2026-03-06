import {
  GcpFirestoreRecordListingFilterOptions,
  GcpFirestoreRecordListingFilterRequestDTO,
} from "./Common.gcp-firestore.dto";

export interface AgencyCvDebitTransactionListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
  agencyUserId: string;
}

export interface AgencyCvDebitTransactionListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
  agencyUserId: string;
}

export interface AgencyCvDebitTransactionCreateDto {
  agencyUserId: string;

  agencyRegisteredEmail: string;

  cvUsed: number;

  agencyBulkJdId: string;
}
