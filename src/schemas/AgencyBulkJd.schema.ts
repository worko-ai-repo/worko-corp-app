// Import Joi
import Joi from "joi";

// Import DTOs
import {
  AgencyBulkJdCreateApiDto,
} from "../dtos/AgencyBulkJd.dto";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

/**
 * agencyBulkJdDTOValidation
 *
 * Joi validation schema for creating Agency Bulk JD
 */
export const agencyBulkJdDTOValidation = Joi.object<AgencyBulkJdCreateApiDto>({
  companyId: Joi.string().optional().messages({
    "any.type": "The Company id field must be a string.",
  }),

  resumesCount: Joi.number().integer().min(1).max(10).required().messages({
    "number.base": "The Resumes count field must be a number.",
    "number.integer": "The Resumes count field must be an integer.",
    "number.min": "The Resumes count field must be at least 1.",
    "any.required": "The Resumes count field is required.",
  }),

  jobTitle: Joi.string().required().lowercase().messages({
    "any.type": "The Job title field must be a string.",
    "string.empty": "The Job title field should not be empty.",
    "any.required": "The Job title field is required.",
  }),

  jobDescription: Joi.string().required().messages({
    "any.required": "The Job description field is required.",
    "any.type": "The Job description field must be a string.",
    "string.empty": "The Job description field should not be empty.",
  }),

  jobLocation: Joi.string().optional().messages({
    "any.type": "The Job location field must be a string.",
  }),

  mustHaveSkills: Joi.array()
    .items(Joi.string().allow(""))
    .optional()
    .default([])
    .messages({
      "array.base": "The Must have skills field should be an array of strings.",
      "string.base": "Each skill must be a string.",
    }),

  mustNotHaveSkills: Joi.array()
    .items(Joi.string().allow(""))
    .optional()
    .default([])
    .messages({
      "array.base":
        "The Must not have skills field should be an array of strings.",
      "string.base": "Each skill must be a string.",
    }),

  goodToHaveSkills: Joi.array()
    .items(Joi.string().allow(""))
    .optional()
    .default([])
    .messages({
      "array.base":
        "The Good to have skills field should be an array of strings.",
      "string.base": "Each skill must be a string.",
    }),

  coreSkills: Joi.array()
    .items(Joi.string().allow(""))
    .optional()
    .default([])
    .messages({
      "array.base": "The Core skills field should be an array of strings.",
      "string.base": "Each skill must be a string.",
    }),

  softSkills: Joi.array()
    .items(Joi.string().allow(""))
    .optional()
    .default([])
    .messages({
      "array.base": "The Soft skills field should be an array of strings.",
      "string.base": "Each skill must be a string.",
    }),

  technicalSkills: Joi.array()
    .items(Joi.string().allow(""))
    .optional()
    .default([])
    .messages({
      "array.base": "The Technical skills field should be an array of strings.",
      "string.base": "Each skill must be a string.",
    }),

  industryPreferences: Joi.array()
    .items(Joi.string().allow(""))
    .optional()
    .default([])
    .messages({
      "array.base":
        "The Industry preferences field should be an array of strings.",
      "string.base": "Each skill must be a string.",
    }),

  experienceRange: Joi.object({
    min: Joi.number().integer().min(0).optional().messages({
      "number.base": "The Min experience field must be a number.",
      "number.integer": "The Min experience field must be an integer.",
      "number.min": "The Min experience field must be a positive number.",
    }),
    max: Joi.number()
      .integer()
      .min(Joi.ref("min")) // Ensure "max" is greater than or equal to min
      .optional()
      .messages({
        "number.base": "The Max experience field must be a number.",
        "number.integer": "The Max experience field must be an integer.",
        "number.min":
          "The Max experience field must be greater than or equal to min experience field.",
      }),
  }).optional(),
});

/**
 * agencyBulkJdFilterDtoValidation
 *
 * Joi validation schema for filtering Agency Bulk JD
 */
export const agencyBulkJdFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    companyId: Joi.string().optional().messages({
      "string.empty": "Company id should not be empty",
    }),
  })
);
