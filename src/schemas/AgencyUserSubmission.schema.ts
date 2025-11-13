import Joi from "joi";

export const agencyUserSubmissionCandidateParseCvApiValidationDto = Joi.object({
   companyId: Joi.string().required().messages({
      "string.empty": "Company id is required",
      "any.required": "Company id is required",
   }),
   jobId: Joi.string().required().messages({
      "string.empty": "Job id is required",
      "any.required": "Job id is required",
   }),
   candidateParsedCvAwsS3FileName: Joi.string().required().messages({
      "string.empty": "Candidate parsed cv aws s3 file name is required",
      "any.required": "Candidate parsed cv aws s3 file name is required",
   }),
});

export const agencyUserSubmissionCreateApiValidationDto = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Candidate Name is required",
    "any.required": "Candidate Name is required",
  }),
  email: Joi.string().required().messages({
    "string.empty": "Candidate Email is required",
    "any.required": "Candidate Email is required",
  }),
  phoneNumberDetails: Joi.object({
    number: Joi.number().required().messages({
      "number.base": "Phone number is required",
      "any.required": "Phone number is required",
    }),
    countryCode: Joi.number().required().messages({
      "number.base": "Country code is required",
      "any.required": "Country code is required",
    }),
  }),
  currentCompany: Joi.string().required().messages({
    "string.empty": "Current Company is required",
    "any.required": "Current Company is required",
  }),
  currentDesignation: Joi.string().required().messages({
    "string.empty": "Current Designation is required",
    "any.required": "Current Designation is required",
  }),
  totalYOE: Joi.number().required().messages({
    "number.base": "Total YOE is required",
    "any.required": "Total YOE is required",
  }),
  relevantYOE: Joi.number().required().messages({
    "number.base": "Relevant YOE is required",
    "any.required": "Relevant YOE is required",
  }),
  currentCTC: Joi.number().required().messages({
    "number.base": "Current CTC is required",
    "any.required": "Current CTC is required",
  }),
  expectedCTC: Joi.number().required().messages({
    "number.base": "Expected CTC is required",
    "any.required": "Expected CTC is required",
  }),
  noticePeriod: Joi.number().required().messages({
    "number.base": "Notice Period is required",
    "any.required": "Notice Period is required",
  }),
  isNoticePeriodNegotiable: Joi.boolean().required().messages({
    "boolean.base": "Is Notice Period Negotiable is required",
    "any.required": "Is Notice Period Negotiable is required",
  }),
  location: Joi.string().required().messages({
    "string.empty": "Location is required",
    "any.required": "Location is required",
  }),
  readyToRelocate: Joi.boolean().required().messages({
    "boolean.base": "Ready to relocate is required",
    "any.required": "Ready to relocate is required",
  }),
  cvAwsS3FileName: Joi.string().required().messages({
    "string.empty": "CV AWS S3 File Name is required",
    "any.required": "CV AWS S3 File Name is required",
  }),
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),
  jobId: Joi.string().required().messages({
    "string.empty": "Job id is required",
    "any.required": "Job id is required",
  }),
});