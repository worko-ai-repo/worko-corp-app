

/**
 * Enum for Razorpay order currency.
 * @see https://razorpay.com/docs/payments/international-payments/#supported-currencies
 */
export enum RazorpayPaymentOrderCurrencyEnum {
  INR = "INR", // Indian Rupee.
}

export enum RazorpayPaymentOrderStatusEnum {
  CREATED = "created",
  ATTEMPTED = "attempted",
  PAID = "paid",
}