import Joi from "joi";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const candidateParsedCvCorpEmbeddingFilterDtoValidation =
  gcpFirestoreCommonSchema.concat(
    Joi.object({
      pageNumber: Joi.number().required().min(1).messages({
        "number.base": "Page number should be a number",
        "any.required": "Page number is required",
        "number.min": "Page number should be at least 1",
      }),
      searchByPrompt: Joi.string().optional().allow(null).messages({
        "string.base": "Search by prompt should be a string",
      }),
      searchByJobId: Joi.string()
        .optional()
        .allow(null)
        .messages({
          "string.base": "Search by job id should be a string",
        }),
    })
  ); 

export const candidateParsedCvAdminEmbeddingFilterDtoValidation =
  gcpFirestoreCommonSchema.concat(
    Joi.object({
      pageNumber: Joi.number().required().min(1).messages({
        "number.base": "Page number should be a number",
        "any.required": "Page number is required",
        "number.min": "Page number should be at least 1",
      }),
      searchByPrompt: Joi.string().optional().allow(null).messages({
        "string.base": "Search by prompt should be a string",
      }),
      searchByJobId: Joi.string()
        .optional()
        .allow(null)
        .messages({
          "string.base": "Search by job id should be a string",
        }),
    })
  ); 

export const moveToApplicantCandidateParsedCvCreateApiDtoValidation = Joi.object({
  candidateParsedCvId: Joi.string().required().messages({
    "any.required": "The candidateParsedCvId field is required.",
    "any.type": "The candidateParsedCvId field must be a string.",
    "string.empty": "The candidateParsedCvId field should not be empty.",
  }),
  jobId: Joi.string().required().messages({
    "any.required": "The jobId field is required.",
    "any.type": "The jobId field must be a string.",
    "string.empty": "The jobId field should not be empty.",
  }),

  companyName: Joi.string().required().uppercase().messages({
    "any.required": "The companyName field is required.",
    "any.type": "The companyName field must be a string.",
    "string.empty": "The companyName field should not be empty.",
  }),
  jobTitle: Joi.string().required().lowercase().messages({
    "any.required": "The jobTitle field is required.",
    "any.type": "The jobTitle field must be a string.",
    "string.empty": "The jobTitle field should not be empty.",
  }),
});

export const candidateParsedCvFindMatchingScoreApiValidationDto = Joi.object({
  candidateParsedCvId: Joi.string().required().messages({
    "any.required": "The candidateParsedCvId field is required.",
    "any.type": "The candidateParsedCvId field must be a string.",
    "string.empty": "The candidateParsedCvId field should not be empty.",
  }),
  jobId: Joi.string().required().messages({
    "any.required": "The jobId field is required.",
    "any.type": "The jobId field must be a string.",
    "string.empty": "The jobId field should not be empty.",
  }),
})