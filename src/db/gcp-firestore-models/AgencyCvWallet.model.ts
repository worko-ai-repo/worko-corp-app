import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyCvWalletDto extends BaseFirestoreModel {
  /**
   * @note we need to store "id" field with "id" field of "AgencyUser.model.ts"
   */

  agencyUserId: string;
  agencyRegisteredEmail: string;

  /**
   * @description total count of cvs available to use by agency
   */
  totalAvailableCvCount: number;

  /**
   * @description count of lifetime CV usage
   */
  totalUsedCvCount: number;

  /**
   * @description
   */
  totalAmountPaid: number;

  /**
   * @description ISO date of last successful recharge
   */
  lastRechargeDate: string;

  /**
   * @description ISO date of last CV usage
   */
  lastCvDeductionDate?: string;

  /**
   * @description Count of successful recharges
   */
  totalRecharges: number;

  updatedByAgencyUserId?: string;
}

export { DbAgencyCvWalletDto };