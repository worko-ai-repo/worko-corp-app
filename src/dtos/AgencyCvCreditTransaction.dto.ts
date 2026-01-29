import {
  GcpFirestoreRecordListingFilterOptions,
  GcpFirestoreRecordListingFilterRequestDTO,
} from "./Common.gcp-firestore.dto";

export interface AgencyCvCreditTransactionListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
  agencyUserId: string;
}

export interface AgencyCvCreditTransactionListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
  agencyUserId: string;
}

export interface AgencyCvCreditTransactionCreateDto {
  agencyUserId: string;

  agencyRegisteredEmail: string;

  cvCount: number;
  amount: number;

  /**
   * @reference "id" field of "DbAgencyCvRechargeOrderDto.model.ts"
   */
  agencyCvRechargeOrderId: string;
}