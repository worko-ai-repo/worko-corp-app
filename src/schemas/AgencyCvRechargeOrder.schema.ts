import Joi from "joi";

// Import enums
import { PaymentGatewayProviderEnum } from "../enums/Common.enum";


export const agencyCvRechargeOrderCreateApiValidationDto = Joi.object({
  agencyCvRechargePackageId: Joi.string().required().messages({
    "string.empty": "Agency cv recharge package id is required",
    "any.required": "Agency cv recharge package id is required",
  }),
  paymentGatewayProvider: Joi.string()
    .valid(...Object.values(PaymentGatewayProviderEnum))
    .required()
    .messages({
      "string.empty": "Payment method is required",
      "any.required": "Payment method is required",
      "any.only": `Invalid payment method. Please provide a valid value from ${Object.values(PaymentGatewayProviderEnum).join(", ")}.`,
    }),
});

export const agencyCvRechargeOrderVerifyPaymentApiValidationDto = Joi.object({
  paymentGatewayProvider: Joi.string()
    .valid(...Object.values(PaymentGatewayProviderEnum))
    .required()
    .messages({
      "string.empty": "Payment method is required",
      "any.required": "Payment method is required",
      "any.only": `Invalid payment method. Please provide a valid value from ${Object.values(PaymentGatewayProviderEnum).join(", ")}.`,
    }),

  paymentGatewayVerificationDetails: Joi.object({
    razorpay_payment_id: Joi.string().required().messages({
      "string.empty": "Razorpay payment id is required",
      "any.required": "Razorpay payment id is required",
    }),
    razorpay_order_id: Joi.string().required().messages({
      "string.empty": "Razorpay order id is required",
      "any.required": "Razorpay order id is required",
    }),
    razorpay_signature: Joi.string().required().messages({
      "string.empty": "Razorpay signature is required",
      "any.required": "Razorpay signature is required",
    }),
  }),
});