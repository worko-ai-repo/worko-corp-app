import Joi from "joi";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const candidateParsedCvCorpEmbeddingFilterDtoValidation =
  gcpFirestoreCommonSchema.concat(
    Joi.object({
      companyId: Joi.string().required().messages({
        "string.empty": "Company id is required",
        "any.required": "Company id is required",
      }),
      searchByPrompt: Joi.string().optional().allow(null).messages({
        "string.base": "Search by prompt should be a string",
      }),
      searchByJobDescription: Joi.string()
        .optional()
        .allow(null)
        .messages({
          "string.base": "Search by job description should be a string",
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
