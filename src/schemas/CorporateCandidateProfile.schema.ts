import Joi from "joi";

// Import enums
import { CorporateCandidateProfileDbRefereeTypeEnum } from "../enums/CorporateCandidateProfile.enum";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const corporateCandidateProfileFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    refereeType: Joi.string().optional().valid(...Object.values(CorporateCandidateProfileDbRefereeTypeEnum)).messages({
      "any.only": `Invalid referee type. Please provide a valid value from ${Object.values(
        CorporateCandidateProfileDbRefereeTypeEnum
      ).join(", ")}.`,
    }),

    companyId: Joi.string().optional().messages({
      "string.base": "The company id field must be a string.",
    }),

    candidateEmail: Joi.string().email().optional().lowercase().messages({
      "string.empty": "Candidate Email should not be empty",
      "string.email": "Invalid email",
    }),

    includeCandidateParsedCvDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include candidate parsed cv details should be a boolean",
    }),

    includeJobDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include job details should be a boolean",
    }),
  })
);