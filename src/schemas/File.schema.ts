import Joi from "joi";

export const filePsuToUploadDtoValidation = Joi.object({
  fileName: Joi.string().required().messages({
    "any.required": "File name is required",
    "string.empty": "File name should not be empty",
    "string.base": "File name must be a string",
  }),

  fileMimeType: Joi.string().required().messages({
    "any.required": "File mime type is required",
    "string.empty": "File mime type should not be empty",
    "string.base": "File mime type must be a string",
  }),
});

export const agencyUserInviteContractCopyPsuToUploadApiDtoValidation =
  filePsuToUploadDtoValidation.concat(
    Joi.object({
      companyId: Joi.string().required().messages({
        "string.empty": "Company id is required",
        "any.required": "Company id is required",
      }),
      agencyInviteId: Joi.string().required().messages({
        "string.empty": "Agency invite id is required",
        "any.required": "Agency invite id is required",
      }),
    })
  );

export const agencyUserInviteContractCopyPsuToViewApiDtoValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),
  agencyInviteId: Joi.string().required().messages({
    "string.empty": "Agency invite id is required",
    "any.required": "Agency invite id is required",
  }),
  contractCopyAwsS3FileName: Joi.string().required().messages({
    "string.empty": "Contract copy aws s3 file name is required",
    "any.required": "Contract copy aws s3 file name is required",
  }),
})

export const agencyUserSubmissionCvPsuToViewApiDtoValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),
  jobId: Joi.string().required().messages({
    "string.empty": "Job id is required",
    "any.required": "Job id is required",
  }),
  /**
   * @reference "id" field of "AgencyUser.model.ts"
   * @description The registered agency user who submitted the "candidate profile"
   */
  agencyUserId: Joi.string().required().messages({
    "string.empty": "Agency user id is required",
    "any.required": "Agency user id is required",
  }),
  candidateCvAwsS3FileName: Joi.string().required().messages({
    "string.empty": "Candidate cv aws s3 file name is required",
    "any.required": "Candidate cv aws s3 file name is required",
  }),
});

export const agencyUserSubmissionCvPsuToUploadApiDtoValidation =
  filePsuToUploadDtoValidation.concat(
    Joi.object({
      companyId: Joi.string().required().messages({
        "string.empty": "Company id is required",
        "any.required": "Company id is required",
      }),
      jobId: Joi.string().required().messages({
        "string.empty": "Job id is required",
        "any.required": "Job id is required",
      }),
    })
  );

export const candidateSubmissionCvForJobPsuToUploadApiDtoValidation =
  filePsuToUploadDtoValidation.concat(
    Joi.object({
      companyId: Joi.string().required().messages({
        "string.empty": "Company id is required",
        "any.required": "Company id is required",
      }),
      jobId: Joi.string().required().messages({
        "string.empty": "Job id is required",
        "any.required": "Job id is required",
      }),
    })
  );

export const agencyBulkCvsPsuToViewApiDtoValidation = Joi.object({
  agencyBulkJdId: Joi.string().required().messages({
    "string.empty": "Agency bulk jd id is required",
    "any.required": "Agency bulk jd id is required",
  }),
  bulkCvsAwsS3FileName: Joi.string().required().messages({
    "string.empty": "Bulk cvs aws s3 file name is required",
    "any.required": "Bulk cvs aws s3 file name is required",
  }),
})

export const corpCandBulkCvUploadPsuToViewApiDtoValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),
  candCvAwsS3FileName: Joi.string().required().messages({
    "string.empty": "Candidate cv aws s3 file name is required",
    "any.required": "Candidate cv aws s3 file name is required",
  }),
})

export const candidateSubmissionCvForJobPsuToViewApiDtoValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),
  jobId: Joi.string().required().messages({
    "string.empty": "Job id is required",
    "any.required": "Job id is required",
  }),
  candCvAwsS3FileName: Joi.string().required().messages({
    "string.empty": "Candidate cv aws s3 file name is required",
    "any.required": "Candidate cv aws s3 file name is required",
  }),
})

export const corpCandReferralCvPsuToViewApiDtoValidation = Joi.object({
  companyId: Joi.string().required().messages({
    "string.empty": "Company id is required",
    "any.required": "Company id is required",
  }),
  candCvAwsS3FileName: Joi.string().required().messages({
    "string.empty": "Candidate cv aws s3 file name is required",
    "any.required": "Candidate cv aws s3 file name is required",
  }),
});

export const adminCandBulkCvUploadPsuToViewApiDtoValidation = Joi.object({
  candCvAwsS3FileName: Joi.string().required().messages({
    "string.empty": "Candidate cv aws s3 file name is required",
    "any.required": "Candidate cv aws s3 file name is required",
  }),
});