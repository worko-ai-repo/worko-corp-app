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

export const candidateParsedCvUpdateApiValidationDto = Joi.object({
  name: Joi.string().optional().messages({
    "string.base": "Name should be a string",
  }),
  currentCompany: Joi.string().optional().messages({
    "string.base": "Current company should be a string",
  }),
  currentDesignation: Joi.string().optional().messages({
    "string.base": "Current designation should be a string",
  }),
  totalYOE: Joi.number().optional().messages({
    "number.base": "Total YOE should be a number",
  }),
  relevantYOE: Joi.number().optional().messages({
    "number.base": "Relevant YOE should be a number",
  }),
  currentCTC: Joi.number().optional().messages({
    "number.base": "Current CTC should be a number",
  }),
  expectedCTC: Joi.number().optional().messages({
    "number.base": "Expected CTC should be a number",
  }),
  noticePeriod: Joi.number().optional().messages({
    "number.base": "Notice period should be a number",
  }),
  location: Joi.string().optional().messages({
    "string.base": "Location should be a string",
  }),
  readyToRelocate: Joi.boolean().optional().messages({
    "boolean.base": "Ready to relocate should be a boolean",
  }),
  isNoticePeriodNegotiable: Joi.boolean().optional().messages({
    "boolean.base": "Is notice period negotiable should be a boolean",
  }),
  coreSkills: Joi.array()
    .items(
      Joi.object({
        skillName: Joi.string().required().empty("").lowercase(),
        years: Joi.number().required().min(0),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
          updatedAt: Joi.string().required(),
        }).optional(),
      })
    )
    
    .optional(),
  technicalSkills: Joi.array()
    .items(
      Joi.object({
        skillName: Joi.string().required().empty("").lowercase(),
        years: Joi.number().required().min(0),
        timestamps: Joi.object({
          createdAt: Joi.string().required(),
          updatedAt: Joi.string().required(),
        }).optional(),
      })
    )
    
    .optional(),
  userPreferredDepartments: Joi.array().items(Joi.string().lowercase()).optional().messages({
    "array.base": "User Preferred Departments must be an array",
  }),
  userPreferredIndustries: Joi.array().items(Joi.string().lowercase()).optional().messages({
    "array.base": "User Preferred Industries must be an array",
  }),
  userPreferredlocations: Joi.array().items(Joi.string().lowercase()).optional().messages({
    "array.base": "User Preferred Locations must be an array",
  }),
  userPreferredRoles: Joi.array().items(Joi.string().lowercase()).optional().messages({
    "array.base": "User Preferred Roles must be an array",
  }),
}).options({ stripUnknown: true });