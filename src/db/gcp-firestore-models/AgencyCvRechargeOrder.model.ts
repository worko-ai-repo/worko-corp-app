
// Import razorpay sdk
import { Orders } from "razorpay/dist/types/orders";

// Import dtos
import { RazorpayPaymentVerificationDTO } from "../../dtos/RazorpayPayment.dto";

// Import enums
import { PaymentGatewayProviderEnum } from "../../enums/Common.enum";
import { RazorpayPaymentOrderStatusEnum } from "../../enums/RazorpayPayment.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyCvRechargeOrderDto extends BaseFirestoreModel {
  // Agency reference
  agencyUserId: string; // Reference to AgencyUser.id
  agencyRegisteredEmail: string;

  // Order details
  agencyCvRechargePackageId: string;

  /**
   * @note This `cvCount` and `amount` are at the time of order creation,
   * in near future if admin updates `cvCount` or `amount` in agencyCvRechargePackageId then
   * dont update `cvCount` and `amount` here.
   * 
   * These `cvCount` and `amount` will be used for tracking that the agency paid this many CV credits with this amount.
   */
  cvCount: number; // Number of CV credits
  amount: number; // Amount in rupees

  // Payment gateway details
  paymentGatewayProvider: PaymentGatewayProviderEnum; // "RAZORPAY"
  paymentGatewayOrderId: string; // Razorpay order ID
  paymentGatewayOrderStatus: RazorpayPaymentOrderStatusEnum;
  paymentGatewayCreatedOrderDetails: Orders.RazorpayOrder;
  paymentGatewayUpdatedOrderDetails?: Orders.RazorpayOrder;

  // Payment completion details (set after payment)
  paymentId?: string; // Razorpay payment ID
  paymentGatewayVerificationDetails?: RazorpayPaymentVerificationDTO;

  updatedByAgencyUserId?: string;
}

export { DbAgencyCvRechargeOrderDto };