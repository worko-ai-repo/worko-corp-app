import Joi from "joi";

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