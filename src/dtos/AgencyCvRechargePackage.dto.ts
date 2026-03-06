import {
  GcpFirestoreRecordListingFilterOptions,
  GcpFirestoreRecordListingFilterRequestDTO,
} from "./Common.gcp-firestore.dto";

export interface AgencyCvRechargePackageCreateApiDto {
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

export interface AgencyCvRechargePackageListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
  /**
   * @description
   *  1. Whether this package is active for purchase
   */
  isActiveForPurchase?: boolean;
}

export interface AgencyCvRechargePackageListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
  /**
   * @description
   *  1. Whether this package is active for purchase
   */
  isActiveForPurchase?: boolean;
}
