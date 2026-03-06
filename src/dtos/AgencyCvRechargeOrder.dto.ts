
// Import dtos
import { RazorpayPaymentVerificationDTO } from "./RazorpayPayment.dto";

// Import enums
import { PaymentGatewayProviderEnum } from "../enums/Common.enum";

export interface AgencyCvRechargeOrderCreateApiDto {
   agencyCvRechargePackageId: string;
   paymentGatewayProvider: PaymentGatewayProviderEnum
}

export interface AgencyCvRechargeOrderVerifyPaymentApiDto {
  paymentGatewayProvider: PaymentGatewayProviderEnum;

  paymentGatewayVerificationDetails: RazorpayPaymentVerificationDTO;
}