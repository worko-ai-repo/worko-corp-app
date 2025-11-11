
import Joi from "joi";

// Import enums
import { AgencyUserInviteAllowedAgencyAllowedStatusEnum, AgencyUserInviteDbStatusEnum } from "../enums/AgencyUserInvite.enum";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

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
   agencyName: Joi.string().required().uppercase().trim().messages({
      "string.empty": "Agency name is required",
      "any.required": "Agency name is required",
   })
});

export const agencyUserInviteCorpUpdateApiValidationDto = Joi.object({
   agencyInviteId: Joi.string().required().messages({
      "string.empty": "Agency invite id is required",
      "any.required": "Agency invite id is required",
   }),
   contractCopyAwsS3FileName: Joi.string().required().messages({
      "string.empty": "Contract copy aws s3 file name is required",
      "any.required": "Contract copy aws s3 file name is required",
   }),
});

export const agencyUserInviteFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    invitedByCorporateUserId: Joi.string().optional().messages({
      "string.empty": "Invited by corporate user id should not be empty",
    }),
    companyId: Joi.string().optional().messages({
      "string.empty": "Company id should not be empty",
    }),
    inviteStatus: Joi.string().valid(...Object.values(AgencyUserInviteDbStatusEnum)).optional().uppercase().messages({
      "string.empty": "Invite status should not be empty",
      "any.only": `Invalid invite status. Please provide a valid value from ${Object.values(
        AgencyUserInviteDbStatusEnum
      ).join(", ")}.`,
    }),
    agencyEmail: Joi.string().email().optional().lowercase().messages({
      "string.empty": "Agency Email should not be empty",
      "string.email": "Invalid email",
    }),
    includeCompanyDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include company details should be a boolean",
    }),
    includeInvitedOwnerDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include invited owner details should be a boolean",
    }),
  })
);

export const agencyUserInviteAgencyUpdateApiValidationDto = Joi.object({
  agencyInviteId: Joi.string().required().messages({
    "string.empty": "Agency invite id is required",
    "any.required": "Agency invite id is required",
  }),
  inviteStatus: Joi.string()
    .valid(...Object.values(AgencyUserInviteAllowedAgencyAllowedStatusEnum))
    .optional()
    .messages({
      "string.empty": "Invite status should not be empty",
      "any.only": `Invalid invite status. Please provide a valid value from ${Object.values(
        AgencyUserInviteAllowedAgencyAllowedStatusEnum
      ).join(", ")}.`,
    }),
});