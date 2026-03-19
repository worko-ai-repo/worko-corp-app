
// Import Joi
import Joi from "joi";

export const bulkSourceTypeResumeCreateApiDtoValidation = Joi.object({
   totalResumesUploaded: Joi.number().required().messages({
      "number.base": "Total resumes uploaded should be a number",
      "any.required": "Total resumes uploaded is required",
   }),
   totalLargeResumesUploaded: Joi.number().optional().messages({
      "number.base": "Total large resumes uploaded should be a number",
   }),
   totalInvalidFileNamesUploaded: Joi.number().optional().messages({
      "number.base": "Total invalid file names uploaded should be a number",
   }),
})