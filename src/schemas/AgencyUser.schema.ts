import Joi from "joi";

export const agencyUserCreateApiValidationDto = Joi.object({
   inviteId: Joi.string().required().messages({
      "string.empty": "Invite id is required",
      "any.required": "Invite id is required",
   })
})