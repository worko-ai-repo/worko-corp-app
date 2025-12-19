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
      jobId: Joi.string().optional().allow(null, "").messages({
        "string.base": "Job id should be a string",
      }),
      currentCompany: Joi.string()
        .optional()
        .uppercase()
        .allow(null, "")
        .messages({
          "string.base": "Current company should be a string",
        }),
      currentDesignation: Joi.string()
        .optional()
        .lowercase()
        .allow(null, "")
        .messages({
          "string.base": "Current designation should be a string",
        }),
      totalYOE: Joi.number().optional().allow(null, "").messages({
        "number.base": "Total YOE should be a number",
      }),
      relevantYOE: Joi.number().optional().allow(null, "").messages({
        "number.base": "Relevant YOE should be a number",
      }),
      currentCTC: Joi.number().optional().allow(null, "").messages({
        "number.base": "Current CTC should be a number",
      }),
      expectedCTC: Joi.number().optional().allow(null, "").messages({
        "number.base": "Expected CTC should be a number",
      }),
      noticePeriod: Joi.number().optional().allow(null, "").messages({
        "number.base": "Notice period should be a number",
      }),
      location: Joi.string().optional().lowercase().allow(null, "").messages({
        "string.base": "Location should be a string",
      }),
      readyToRelocate: Joi.boolean().optional().allow(null, "").messages({
        "boolean.base": "Ready to relocate should be a boolean",
      }),
      isNoticePeriodNegotiable: Joi.boolean()
        .optional()
        .allow(null, "")
        .messages({
          "boolean.base": "Is notice period negotiable should be a boolean",
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