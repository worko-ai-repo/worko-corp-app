import Joi from "joi";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

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
   agencyUserInviteId: Joi.string().required().messages({
      "string.empty": "Agency user invite id is required",
      "any.required": "Agency user invite id is required",
   })
});

export const agencyUserSubmissionCreateApiValidationDto = Joi.object({
  name: Joi.string().required().lowercase().messages({
    "string.empty": "Candidate Name is required",
    "any.required": "Candidate Name is required",
  }),
  email: Joi.string().required().lowercase().messages({
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
  currentCompany: Joi.string().required().uppercase().messages({
    "string.empty": "Current Company is required",
    "any.required": "Current Company is required",
  }),
  currentDesignation: Joi.string().required().lowercase().messages({
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
  about: Joi.string().optional().messages({
    "string.base": "About must be a string",
  }),
  education: Joi.array()
    .items(
      Joi.object({
        degree: Joi.string().required().lowercase().messages({
          "string.empty": "Degree is required",
          "any.required": "Degree is required",
        }),

        collage: Joi.string().required().lowercase().messages({
          "string.empty": "College is required",
          "any.required": "College is required",
        }),

        startedYear: Joi.number().optional().messages({
          "number.base": "Started Year is required",
          "any.required": "Started Year is required",
        }),

        passingYear: Joi.number().required().messages({
          "number.base": "Passing Year is required",
          "any.required": "Passing Year is required",
        }),

        grade: Joi.string().optional().messages({
          "string.empty": "Grade is required",
          "any.required": "Grade is required",
        }),
        field: Joi.string().optional().messages({
          "string.empty": "Field is required",
          "any.required": "Field is required",
        }),
      }),
    )
    .optional(),

  location: Joi.string().required().lowercase().messages({
    "string.empty": "Location is required",
    "any.required": "Location is required",
  }),
  readyToRelocate: Joi.boolean().required().messages({
    "boolean.base": "Ready to relocate is required",
    "any.required": "Ready to relocate is required",
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
    .default([])
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
    .default([])
    .optional(),
  userPreferredDepartments: Joi.array().items(Joi.string().lowercase()).required().default([]).messages({
    "array.base": "User Preferred Departments must be an array",
    "any.required": "User Preferred Departments is required",
  }),
  userPreferredIndustries: Joi.array().items(Joi.string().lowercase()).required().default([]).messages({
    "array.base": "User Preferred Industries must be an array",
    "any.required": "User Preferred Industries is required",
  }),
  userPreferredlocations: Joi.array().items(Joi.string().lowercase()).required().default([]).messages({
    "array.base": "User Preferred Locations must be an array",
    "any.required": "User Preferred Locations is required",
  }),
  userPreferredRoles: Joi.array().items(Joi.string().lowercase()).required().default([]).messages({
    "array.base": "User Preferred Roles must be an array",
    "any.required": "User Preferred Roles is required",
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
  agencyUserInviteId: Joi.string().required().messages({
    "string.empty": "Agency user invite id is required",
    "any.required": "Agency user invite id is required",
  }),
  agencyComments: Joi.string().optional().lowercase().messages({
    "string.base": "Agency comments must be a string",
  })
});

export const agencyUserSubmissionFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    companyId: Joi.string().optional().messages({
      "string.empty": "Company id should not be empty",
    }),
    jobId: Joi.string().optional().messages({
      "string.empty": "Job id should not be empty",
    }),
    candidateEmail: Joi.string().email().optional().lowercase().messages({
      "string.empty": "Candidate Email should not be empty",
      "string.email": "Invalid email",
    }),
    agencyRegisteredEmail: Joi.string().email().optional().lowercase().messages({
      "string.empty": "Agency Registered Email should not be empty",
      "string.email": "Invalid email",
    }),
    agencyJobAssignedByCorporateUserId: Joi.string().optional().messages({
      "string.empty": "Agency job assigned by corporate user id should not be empty",
    }),
    agencyName: Joi.string().optional().uppercase().messages({
      "string.empty": "Agency name should not be empty",
    }),
    includeJobDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include job details should be a boolean",
    }),
    includeCandidateParsedCvDetails: Joi.boolean().optional().messages({
      "boolean.base": "Include candidate parsed cv details should be a boolean",
    }),
  })
);

export const agencyUserSubmissionFindMatchingScoreApiValidationDto = Joi.object({
  agencyUserSubmissionId: Joi.string().required().messages({
    "string.empty": "Agency user submission id is required",
    "any.required": "Agency user submission id is required",
  }),
});

export const agencyUserSubmissionBulkFindMatchingScoreApiValidationDto = Joi.object({
  agencyUserSubmissionIds: Joi.array().items(Joi.string()).min(1).max(10).required().messages({
    "array.base": "Agency user submission ids must be an array",
    "array.min": "At least one agency user submission id is required",
    "array.max": "Maximum 10 agency user submission ids allowed",
    "any.required": "Agency user submission ids are required",
  }),
});

export const agencyUserSubmissionMoveToApplicantCreateApiDtoValidation = Joi.object({
  agencyUserSubmissionId: Joi.string().required().messages({
    "any.required": "The agencyUserSubmissionId field is required.",
    "any.type": "The agencyUserSubmissionId field must be a string.",
    "string.empty": "The agencyUserSubmissionId field should not be empty.",
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

export const agencyUserSubmissionSendForEvaluationCreateApiDtoValidation = Joi.object({
  agencyUserSubmissionId: Joi.string().required().messages({
    "any.required": "The agencyUserSubmissionId field is required.",
    "any.type": "The agencyUserSubmissionId field must be a string.",
    "string.empty": "The agencyUserSubmissionId field should not be empty.",
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

export const agencyUserSubmissionRejectApplicantCreateApiDtoValidation = Joi.object({
  agencyUserSubmissionId: Joi.string().required().messages({
    "any.required": "The agencyUserSubmissionId field is required.",
    "any.type": "The agencyUserSubmissionId field must be a string.",
    "string.empty": "The agencyUserSubmissionId field should not be empty.",
  }),
  rejectApplicantReason: Joi.string().required().messages({
    "any.required": "The rejectApplicantReason field is required.",
    "any.type": "The rejectApplicantReason field must be a string.",
    "string.empty": "The rejectApplicantReason field should not be empty.",
  }),
  rejectApplicantDetailedReason: Joi.string().optional().messages({
    "any.type": "The rejectApplicantDetailedReason field must be a string.",
  }),
});

export const agencyUserSubmissionMoveToApplicantBulkCreateApiDtoValidation = Joi.object({
  agencyUserSubmissions: Joi.array().min(1).max(10).items(
    Joi.object({
      agencyUserSubmissionId: Joi.string().required().messages({
        "any.required": "The agency user submission id field is required.",
        "any.type": "The agency user submission id field must be a string.",
        "string.empty": "The agency user submission id field should not be empty.",
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
    })
  ).required().messages({
    "array.min": "At least one agency user submission must be provided",
    "array.max": "Cannot process more than 10 agency user submissions at a time",
  }),
})

export const agencyUserSubmissionSendForEvaluationBulkCreateApiDtoValidation = Joi.object({
  agencyUserSubmissions: Joi.array().min(1).max(10).items(
    Joi.object({
      agencyUserSubmissionId: Joi.string().required().messages({
        "any.required": "The agency user submission id field is required.",
        "any.type": "The agency user submission id field must be a string.",
        "string.empty": "The agency user submission id field should not be empty.",
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
    })
  ).required().messages({
    "array.min": "At least one agency user submission must be provided",
    "array.max": "Cannot process more than 10 agency user submissions at a time",
  }),
})

export const agencyUserSubmissionRejectApplicantBulkApiDtoValidation = Joi.object({
  agencyUserSubmissionIds: Joi.array().items(Joi.string()).min(1).max(10).required().messages({
    "array.min": "At least one agency user submission id must be provided",
    "array.max": "Cannot process more than 10 agency user submission ids at a time",
  }),
  rejectApplicantReason: Joi.string().required().messages({
    "any.required": "The rejectApplicantReason field is required.",
    "any.type": "The rejectApplicantReason field must be a string.",
    "string.empty": "The rejectApplicantReason field should not be empty.",
  }),
  rejectApplicantDetailedReason: Joi.string().optional().messages({
    "any.type": "The rejectApplicantDetailedReason field must be a string.",
  }),
});