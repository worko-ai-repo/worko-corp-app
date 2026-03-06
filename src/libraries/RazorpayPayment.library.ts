

import Razorpay from "razorpay";
import { Orders } from "razorpay/dist/types/orders";
import { IMap } from "razorpay/dist/types/api";

import crypto from "crypto";

// Import dtos
import { RazorpayPaymentVerificationDTO } from "../dtos/RazorpayPayment.dto";

// Import enums
import { RazorpayPaymentOrderCurrencyEnum } from "../enums/RazorpayPayment.enum";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * Integrate with Razorpay Node.js server-side SDK.
 * @see https://razorpay.com/docs/payments/server-integration/nodejs/
 */
class RazorpayPaymentLibrary {
  private razorpay: Razorpay;

  constructor() {
    if (
      !process.env.APP_RAZORPAY_KEY_ID ||
      !process.env.APP_RAZORPAY_KEY_SECRET
    ) {
      global.logger.error(
        `RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined in .env file.`,
      );
      throw new BaseError(
        "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined in .env file.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      );
    }

    this.razorpay = new Razorpay({
      key_id: process.env.APP_RAZORPAY_KEY_ID!,
      key_secret: process.env.APP_RAZORPAY_KEY_SECRET!,
    });
  }

  /**
   * Create order for payment
   *
   * Create an Order in Server
   * @see https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/#12-create-an-order-in-server
   *
   * Create an Order Api
   * @see https://razorpay.com/docs/api/orders/create/
   */
  async createOrder<RazorpayPaymentNotesDto extends IMap<string | number>>(
    finalAmount: number,
    notes: RazorpayPaymentNotesDto,
  ): Promise<Orders.RazorpayOrder> {
    if (finalAmount <= 0) {
      throw new BaseError(
        "Amount must be greater than zero",
        HttpStatusCode.BAD_REQUEST_400,
      );
    }

    /**
     * Request Parameters
     * @see https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/#122-request-parameters
     */
    const reqBody:
      | Orders.RazorpayOrderCreateRequestBody
      | Orders.RazorpayTransferCreateRequestBody
      | Orders.RazorpayAuthorizationCreateRequestBody = {
      amount: Math.round(finalAmount * 100), // Convert amount to paise,
      currency: RazorpayPaymentOrderCurrencyEnum.INR,
      notes,
    };

    try {
      global.logger.info("Creating Razorpay order...", {
        reqBody,
      });

      /*
      {
        "amount": 10000,
        "amount_due": 10000,
        "amount_paid": 0,
        "attempts": 0,
        "created_at": 1769154002,
        "currency": "INR",
        "entity": "order",
        "id": "order_S7EzXpj4zdImb7",
        "notes": {
            "agencyUserId": "0H0F6NM811E378MN13R1BM07CT"
        },
        "offer_id": null,
        "receipt": null,
        "status": "created"
      }
      */
      const order: Orders.RazorpayOrder =
        await this.razorpay.orders.create(reqBody);

      return order;
    } catch (error: any) {
      global.logger.error("Razorpay order creation failed:", error);
      throw new BaseError(
        `Internal Server Error`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      );
    }
  }

  /**
   * @see https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/#15-verify-payment-signature 
   */
  async verifyPaymentSignature(paymentGatewayVerificationDetails: RazorpayPaymentVerificationDTO): Promise<boolean> {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = paymentGatewayVerificationDetails;
    const secret: string | undefined = process.env.APP_RAZORPAY_KEY_SECRET;
    if(!secret) {
      global.logger.error("RAZORPAY_KEY_SECRET is not defined in .env file.");
      throw new BaseError(
        "RAZORPAY_KEY_SECRET is not defined in .env file.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      );
    }
    const data: string = `${orderId}|${paymentId}`; // Concatenate order ID and payment ID
    const hmac: crypto.Hmac = crypto.createHmac("sha256", secret); // Create HMAC using sha256 and secret key
    hmac.update(data); // Update HMAC with the data
    const digest: string = hmac.digest("hex"); // Generate the HMAC digest
    return digest === signature; // Compare the generated digest with the provided signature
  }

  /**
   * Fetch order details
   */
  async fetchOrder(orderId: string): Promise<Orders.RazorpayOrder> {
    return this.razorpay.orders.fetch(orderId);
  }
}

const razorpayPaymentLibraryObj: RazorpayPaymentLibrary = new RazorpayPaymentLibrary();
export { razorpayPaymentLibraryObj, RazorpayPaymentLibrary };