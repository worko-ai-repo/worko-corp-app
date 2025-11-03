
import Joi from "joi";

export const agencyUserInviteCreateApiValidationDto = Joi.object({
   name: Joi.string().required().lowercase().trim().messages({
      "string.empty": "Name is required",
      "any.required": "Name is required",
   }),
   email: Joi.string().email().required().lowercase().trim().messages({
      "string.empty": "Email is required",
      "any.required": "Email is required",
      "string.email": "Invalid email",
   }),
   phoneNumberDetails: Joi.object({
      number: Joi.number().required().messages({
         "number.base": "Phone number is required",
         "any.required": "Phone number is required",
      }),
      countryCode: Joi.number().required().messages({
         "number.base": "Country code is required",
         "any.required": "Country code is required",
      }),
   }).required().messages({
      "object.base": "Phone number details are required",
      "any.required": "Phone number details are required",
   }),
   companyId: Joi.string().required().messages({
      "string.empty": "Company id is required",
      "any.required": "Company id is required",
   }),
   GSTIN: Joi.string().optional().messages({
      "string.empty": "GSTIN should not be empty",
   }),
   contractCopyUserFileName: Joi.string().optional().messages({
      "string.empty": "Contract copy user file name should not be empty",
   }),
});

export const agencyUserInviteUpdateApiValidationDto = Joi.object({
   agencyInviteId: Joi.string().required().messages({
      "string.empty": "Agency invite id is required",
      "any.required": "Agency invite id is required",
   }),
   contractCopyAwsS3FileName: Joi.string().required().messages({
      "string.empty": "Contract copy aws s3 file name is required",
      "any.required": "Contract copy aws s3 file name is required",
   }),
});