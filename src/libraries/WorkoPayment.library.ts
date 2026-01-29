import { Orders } from "razorpay/dist/types/orders";
import { IMap } from "razorpay/dist/types/api";

// Import dtos
import { RazorpayPaymentVerificationDTO } from "../dtos/RazorpayPayment.dto";

// Import enums
import { PaymentGatewayProviderEnum } from "../enums/Common.enum";

// Import libraries
import { razorpayPaymentLibraryObj } from "./RazorpayPayment.library";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import e from "express";

class WorkoPaymentLibrary {
  async createOrder<WorkoPaymentNotesDto extends IMap<string | number>>(
    finalAmount: number,
    notes: WorkoPaymentNotesDto,
    paymentGatewayProvider: PaymentGatewayProviderEnum,
  ): Promise<Orders.RazorpayOrder> {
    if(paymentGatewayProvider === PaymentGatewayProviderEnum.RAZORPAY) {
      return razorpayPaymentLibraryObj.createOrder(finalAmount, notes);
    } else {
      throw new BaseError(
        "Payment gateway provider not supported.",
        HttpStatusCode.BAD_REQUEST_400,
      );
    }
  }

  async verifyPaymentSignature(
   paymentGatewayProvider: PaymentGatewayProviderEnum,
   paymentGatewayVerificationDetails: RazorpayPaymentVerificationDTO
  ): Promise<boolean> {
   if(paymentGatewayProvider === PaymentGatewayProviderEnum.RAZORPAY) {
     return razorpayPaymentLibraryObj.verifyPaymentSignature(paymentGatewayVerificationDetails);
   } else {
     throw new BaseError(
       "Payment gateway provider not supported.",
       HttpStatusCode.BAD_REQUEST_400,
     );
   }
  }

  async fetchOrder(paymentGatewayProvider: PaymentGatewayProviderEnum, orderId: string): Promise<Orders.RazorpayOrder> {
    if(paymentGatewayProvider === PaymentGatewayProviderEnum.RAZORPAY) {
      return razorpayPaymentLibraryObj.fetchOrder(orderId);
    } else {
      throw new BaseError(
        "Payment gateway provider not supported.",
        HttpStatusCode.BAD_REQUEST_400,
      );
    }
  }
}

const workoPaymentLibraryObj = new WorkoPaymentLibrary();
export { workoPaymentLibraryObj, WorkoPaymentLibrary };
