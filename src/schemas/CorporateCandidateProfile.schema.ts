import Joi from "joi";

// Import enums
import { CorporateCandidateProfileDbRefereeTypeEnum } from "../enums/CorporateCandidateProfile.enum";
import { HiringEligibilityStatusEnum } from "../enums/Common.enum";
import { BulkSourceTypeParseResumeStatusEnum } from "../enums/BulkSourceTypeParseResume.enum";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const corporateCandidateProfileFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    refereeType: Joi.string().optional().valid(...Object.values(CorporateCandidateProfileDbRefereeTypeEnum)).messages({
      "any.only": `Invalid referee type. Please provide a valid value from ${Object.values(
        CorporateCandidateProfileDbRefereeTypeEnum
      ).join(", ")}.`,
    }),

    hiringEligibilityStatus: Joi.string().optional().valid(...Object.values(HiringEligibilityStatusEnum)).messages({
      "any.only": `Invalid hiring eligibility status. Please provide a valid value from ${Object.values(
        HiringEligibilityStatusEnum
      ).join(", ")}.`,
    }),

    companyId: Joi.string().required().messages({
      "string.base": "The company id field must be a string.",
      "string.empty": "The company id field should not be empty.",
      "any.required": "The company id field is required.",
    }),

    includeCandidateParsedCvDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include candidate parsed cv details should be a boolean",
    }),

    includeJobDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include job details should be a boolean",
    }),
  })
);

export const corporateCandidateProfileDuplicationRequestDtoValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),
  candidateEmailId: Joi.string().required().lowercase().messages({
    "string.empty": "Candidate email id is required",
    "any.required": "Candidate email id is required",
  }),
  phoneNumber: Joi.number().required().messages({
    "number.base": "Phone number should be a number",
    "any.required": "Phone number is required",
  }),
  phoneCountryCode: Joi.number().required().messages({
    "number.base": "Phone country code should be a number",
    "any.required": "Phone country code is required",
  }),
});

export const corporateCandidateProfileBulkCvPsuToUploadApiDtoValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),
  bulkCvs: Joi.array().items(
    Joi.object({
      fileName: Joi.string().required().messages({
        "string.empty": "File name is required",
        "any.required": "File name is required",
      }),
      fileMimeType: Joi.string().required().messages({
        "string.empty": "File mime type is required",
        "any.required": "File mime type is required",
      }),
      bulkSourceTypeParseResumeStatus: Joi.string().optional().valid(
        BulkSourceTypeParseResumeStatusEnum.LARGE_RESUME_FILE,
        BulkSourceTypeParseResumeStatusEnum.INVALID_FILE_NAME
      ).messages({
        "any.only": `Invalid bulk source type parse resume status. Please provide a valid value from 
        ${BulkSourceTypeParseResumeStatusEnum.INVALID_FILE_NAME}, ${BulkSourceTypeParseResumeStatusEnum.LARGE_RESUME_FILE}.`,
      })
    })
  ).required().min(1).max(50).messages({
    "array.base": "Bulk cvs should be an array",
    "any.required": "Bulk cvs is required",
    "array.min": "Bulk cvs should have at least 1 item",
    "array.max": "Bulk cvs should have at most 50 items"
  }),
  bulkSourceTypeResumeId: Joi.string().required().messages({
    "string.empty": "Bulk source type resume id is required",
    "any.required": "Bulk source type resume id is required",
  })
});

export const corporateCandidateProfileBlacklistBulkApiDtoValidation = Joi.object({
  reasonForBlacklisting: Joi.string().required().messages({
    "string.empty": "Reason for blacklisting is required",
    "any.required": "Reason for blacklisting is required",
  }),
  detailedReasonForBlacklisting: Joi.string().optional().messages({
    "string.empty": "Detailed reason for blacklisting is required",
    "any.required": "Detailed reason for blacklisting is required",
  }),
  corporateCandidateProfileIds: Joi.array().items(Joi.string()).min(1).max(10).required().messages({
    "array.base": "Corporate candidate profile ids must be an array",
    "array.min": "At least one corporate candidate profile id is required",
    "array.max": "Maximum 10 corporate candidate profile ids allowed",
    "any.required": "Corporate candidate profile ids are required",
  })
})