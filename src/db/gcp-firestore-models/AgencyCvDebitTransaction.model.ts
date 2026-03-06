import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyCvDebitTransactionDto extends BaseFirestoreModel  {
  agencyUserId: string;

  agencyRegisteredEmail: string;

  cvUsed: number;

  agencyBulkJdId: string;
}

export { DbAgencyCvDebitTransactionDto };