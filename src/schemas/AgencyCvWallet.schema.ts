import Joi from "joi";

export const createAgencyCvWalletSchema = Joi.object({
  agencyUserId: Joi.string().required(),
  balance: Joi.number().min(0).required()
});

export const updateAgencyCvWalletSchema = Joi.object({
  balance: Joi.number().min(0).optional()
});