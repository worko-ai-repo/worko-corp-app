import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyCvRechargePackageDto extends BaseFirestoreModel {
  /**
   * @reference "id" attribute of "UserDetail.model.ts"
   */
  createdByUserId: string;
  updatedByUserId?: string;

  /**
   * @description
   *  1. Amount per CV user needs to pay
   *  2. For one cv user need to pay 15 rupees
   * @example 15
   */
  amountPerCv: number;

  /**
   * @description
   *  1. Total CV count user will get on recharge
   * @example 200
   */
  totalCvCount: number;

  /**
   * @example 3000
   * @description
   *  1. Total amount user will get on recharge
   *  2. 3000 means 3000 rupees
   *  3. totalAmount = amountPerCv * totalCvCount
   *                 = 15 * 200
   *                 = 3000
   */
  totalAmount: number;

  /**
   * @description
   *  1. Whether this package is active for purchase
   */
  isActiveForPurchase: boolean;

  /**
   * @description
   *  1. Description of the package
   */
  description?: string;
}

export { DbAgencyCvRechargePackageDto };
