

/**
* @see https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/#14-store-fields-in-your-server
*/
export interface RazorpayPaymentVerificationDTO {
  razorpay_payment_id: string; // "pay_29QQoUBi66xm2f";
  razorpay_order_id: string; // "order_9A33XWu170gUtm";
  razorpay_signature: string; // "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d";
}