import Joi from "joi";

// Import enums
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const centralCandidateProfileFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    refereeType: Joi.string().optional().valid(...Object.values(CentralCandidateProfileDbRefereeTypeEnum)).messages({
      "any.only": `Invalid referee type. Please provide a valid value from ${Object.values(
        CentralCandidateProfileDbRefereeTypeEnum
      ).join(", ")}.`,
    }),

    candidateEmail: Joi.string().email().optional().lowercase().messages({
      "string.empty": "Candidate Email should not be empty",
      "string.email": "Invalid email",
    }),

    includeCandidateParsedCvDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include candidate parsed cv details should be a boolean",
    }),
  })
);