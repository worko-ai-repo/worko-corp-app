import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyCvCreditTransactionDto extends BaseFirestoreModel  {
  agencyUserId: string;

  agencyRegisteredEmail: string;

  cvCount: number;
  amount: number;

  /**
   * @reference "id" field of "DbAgencyCvRechargeOrderDto.model.ts"
   */
  agencyCvRechargeOrderId: string;
}

export { DbAgencyCvCreditTransactionDto };