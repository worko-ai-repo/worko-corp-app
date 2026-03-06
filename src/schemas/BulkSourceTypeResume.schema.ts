
// Import Joi
import Joi from "joi";

export const bulkSourceTypeResumeCreateApiDtoValidation = Joi.object({
   totalResumesUploaded: Joi.number().required().messages({
      "number.base": "Total resumes uploaded should be a number",
      "any.required": "Total resumes uploaded is required",
   })
})