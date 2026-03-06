export interface AgencyCvWalletCreateDto {
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
   * @description Count of successful recharges
   */
  totalRecharges: number;
}