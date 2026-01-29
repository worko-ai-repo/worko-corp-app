import Joi from "joi";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const agencyCvRechargePackageCreateApiValidationDto = Joi.object({
  amountPerCv: Joi.number().required().messages({
    "number.base": "Amount per cv should be a number",
    "any.required": "Amount per cv is required.",
  }),
  totalCvCount: Joi.number().required().messages({
    "number.base": "Total cv count should be a number",
    "any.required": "Total cv count is required",
  }),
  isActiveForPurchase: Joi.boolean().required().messages({
    "boolean.base": "isActiveForPurchase should be a boolean",
    "any.required": "isActiveForPurchase is required",
  }),
  description: Joi.string().optional().messages({
    "string.base": "Description should be a string",
  }),
});

export const agencyCvRechargePackageFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    isActiveForPurchase: Joi.boolean().optional().messages({
      "boolean.base": "isActiveForPurchase should be a boolean",
    }),
  })
);
