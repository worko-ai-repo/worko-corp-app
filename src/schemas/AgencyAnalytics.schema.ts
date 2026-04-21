// import the necessary npm packages
import Joi from "joi";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

/**
 * agencyAnalyticsFilterDtoValidation
 *
 * Validation schema for performance matrix/ranking filter query params.
 */
export const agencyAnalyticsFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    agencyId: Joi.string().optional().allow("", null).messages({
      "string.base": "The agencyId field must be a valid string.",
    }),

    companyId: Joi.string().required().messages({
      "any.required": "The companyId is required.",
      "string.base": "The companyId must be a valid string.",
    }),

    roleId: Joi.string().optional().allow("", null).messages({
      "string.base": "The roleId field must be a valid string.",
    }),
  }),
);

