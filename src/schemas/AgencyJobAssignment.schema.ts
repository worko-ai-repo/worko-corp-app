import Joi from "joi";

// Import enums
import { AgencyJobAssignmentDbStatusEnum } from "../enums/AgencyJobAssignment.enum";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const agencyJobAssignmentBulkCreateApiDtoValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),

  jobsToAssign: Joi.array()
    .items(
      Joi.string().required().messages({
        "string.empty": "Job id is required",
        "any.required": "Job id is required",
      })
    )
    .required()
    .min(1)
    .max(10)
    .messages({
      "array.empty": "Jobs to assign is required",
      "any.required": "Jobs to assign is required",
      "array.min": "At least one job id is required",
      "array.max": "Maximum 10 job ids are allowed",
      "array.base": "Jobs to assign must be an array of strings",
    }),

  agencyEmail: Joi.string().email().lowercase().required().messages({
    "string.empty": "Agency email is required",
    "any.required": "Agency email is required",
  }),

  agencyInviteId: Joi.string().required().messages({
    "string.empty": "Agency invite id is required",
    "any.required": "Agency invite id is required",
  }),
});

export const agencyJobAssignmentFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    status: Joi.string()
      .valid(...Object.values(AgencyJobAssignmentDbStatusEnum))
      .optional()
      .uppercase()
      .messages({
        "string.empty": "Status should not be empty",
        "any.only": `Invalid Status. Please provide a valid value from ${Object.values(
          AgencyJobAssignmentDbStatusEnum
        ).join(", ")}.`,
      }),
    agencyRegisteredEmail: Joi.string().email().optional().lowercase().messages({
      "string.empty": "Agency registered email should not be empty",
      "string.email": "Invalid email",
    }),
    includeJobDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include job details should be a boolean",
    }),
    companyId: Joi.string().optional().messages({
      "string.empty": "Company id should not be empty",
    }),
  })
);