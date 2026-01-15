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

export const centralCandidateProfileBulkCvPsuToUploadApiDtoValidation = Joi.object({
  bulkCvs: Joi.array().items(
    Joi.object({
      fileName: Joi.string().required().messages({
        "string.empty": "File name is required",
        "any.required": "File name is required",
      }),
      fileMimeType: Joi.string().required().messages({
        "string.empty": "File mime type is required",
        "any.required": "File mime type is required",
      }),
    })
  ).required().min(1).max(10).messages({
    "array.base": "Bulk cvs should be an array",
    "any.required": "Bulk cvs is required",
    "array.min": "Bulk cvs should have at least 1 item",
    "array.max": "Bulk cvs should have at most 10 items"
  })
})