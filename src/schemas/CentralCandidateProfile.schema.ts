import Joi from "joi";

// Import enums
import { CentralCandidateProfileDbRefereeTypeEnum } from "../enums/CentralCandidateProfile.enum";
import { BulkSourceTypeParseResumeStatusEnum } from "../enums/BulkSourceTypeParseResume.enum";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const centralCandidateProfileFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    refereeType: Joi.string().optional().valid(...Object.values(CentralCandidateProfileDbRefereeTypeEnum)).messages({
      "any.only": `Invalid referee type. Please provide a valid value from ${Object.values(
        CentralCandidateProfileDbRefereeTypeEnum
      ).join(", ")}.`,
    }),

    includeCandidateParsedCvDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include candidate parsed cv details should be a boolean",
    }),

    companyName: Joi.string().uppercase().optional().messages({
      "string.base": "Company name should be a string",
    }),
  })
);

export const centralCandidateProfileBulkCvPsuToUploadApiDtoValidation = Joi.object({
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
        BulkSourceTypeParseResumeStatusEnum.INVALID_FILE_NAME,
      ).messages({
        "any.only": `Invalid bulk source type parse resume status. Please provide a valid value from ${
          BulkSourceTypeParseResumeStatusEnum.LARGE_RESUME_FILE}, ${BulkSourceTypeParseResumeStatusEnum.INVALID_FILE_NAME}.`,
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
})