

import Joi from "joi";

// Import schemas
import { gcpFirestoreCommonSchema, optionalCommaSeparatedStringToArray } from "./Common.gcp-firestore.schema";

export const candidateJobMatchingFilterDtoValidation = gcpFirestoreCommonSchema.concat(
   Joi.object({
    candidateJobMatchingIds: Joi.string()
      .optional()
      .allow("", null)
      .custom(
        optionalCommaSeparatedStringToArray,
        "Comma-separated string to array"
      )
      .messages({
        "string.base": "The Candidate job matching ids field must be a string.",
        "string.commaSeparated":
          "Please provide valid comma-separated company names.",
      }),
   })
)
