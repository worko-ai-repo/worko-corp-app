import Joi from "joi";

// Import schemas
import { gcpFirestoreCommonSchema } from "./Common.gcp-firestore.schema";

export const agencyCvCreditTransactionFilterDtoValidation = gcpFirestoreCommonSchema.concat(
  Joi.object({
    agencyUserId: Joi.string().required().messages({
      "string.empty": "Agency user id is required",
      "any.required": "Agency user id is required",
    })
  })
);

