// Import Joi
import Joi from "joi";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

/**
 * agencyBulkJdResumeDTOValidation
 *
 * Joi validation schema for creating Agency Bulk JD Resume
 */
export const agencyBulkJdResumeDTOValidation = Joi.object({
  bulkCvs: Joi.array().items(
    Joi.object({
      fileName: Joi
          .string()
          .required()
          .messages({
            "any.required": "The File name field is required.",
            "any.type": "The File name field must be a string.",
            "string.empty": "The File name field should not be empty.",
          }),

      fileMimeType: Joi
          .string()
          .required()
          .messages({
            "any.required": "The File mime type field is required.",
            "any.type": "The File mime type field must be a string.",
            "string.empty": "The File mime type field should not be empty.",
          }),
      })
  ).min(1).max(10)
    .required()
    .messages({
    "array.min": "At least one CV file is required.",
    "array.base": "Bulk CVs should be an array of objects.",
    "any.required": "Bulk CVs are required.",
  })
});

export const agencyBulkJdResumeFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    agencyBulkJdId: Joi.string().required().messages({
      "string.empty": "Agency bulk jd id should not be empty",
    })
  })
);
