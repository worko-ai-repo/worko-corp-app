
import { NextFunction, Request, Response } from "express";

// Import dtos
import { AgencyCvRechargeOrderCreateApiDto, AgencyCvRechargeOrderVerifyPaymentApiDto } from "../dtos/AgencyCvRechargeOrder.dto";

// Import models
import { DbAgencyCvRechargeOrderDto } from "../db/gcp-firestore-models/AgencyCvRechargeOrder.model";

// Import services
import { agencyCvRechargeOrderServiceObj } from "../services/AgencyCvRechargeOrder.service";

// Import schemas
import { agencyCvRechargeOrderCreateApiValidationDto, agencyCvRechargeOrderVerifyPaymentApiValidationDto } from "../schemas/AgencyCvRechargeOrder.schema";

// Import utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyCvRechargeOrderController {

   createAgencyCvRechargeOrder = async(req: Request, res: Response, next: NextFunction) => {
      try {
         const requestBody: AgencyCvRechargeOrderCreateApiDto = req.body;
         const { error: reqBodyError, value: validatedRequestBody } = agencyCvRechargeOrderCreateApiValidationDto.validate(requestBody, { abortEarly: false });
         if (reqBodyError) {
            throw new RequestValidationError(reqBodyError);
         }
         const response: DbAgencyCvRechargeOrderDto | undefined =
           await agencyCvRechargeOrderServiceObj.performCreateAgencyCvRechargeOrderActivities(
             validatedRequestBody,
           );
         if(!response) {
            global.logger.error("Create Agency Cv Recharge Order Failed - Undefined Response", {
               methodName: this.createAgencyCvRechargeOrder.name,
               requestBody,
               validatedRequestBody
            });
            throw new BaseError("Internal server error.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
         }
         res.status(HttpStatusCode.CREATED_201).json(response);
      } catch (error) {
         global.logger.error(`Create Agency Cv Recharge Order [Controller]`, {
            methodName: this.createAgencyCvRechargeOrder.name,
            error,
         });
         next(error);
      }
   }

   verifyPaymentAgencyCvRechargeOrder = async(req: Request, res: Response, next: NextFunction) => {
      try {
         const requestBody: AgencyCvRechargeOrderVerifyPaymentApiDto = req.body;
         const { error: reqBodyError, value: validatedRequestBody } = agencyCvRechargeOrderVerifyPaymentApiValidationDto.validate(requestBody, { abortEarly: false });
         if (reqBodyError) {
            throw new RequestValidationError(reqBodyError);
         }
         const response = await agencyCvRechargeOrderServiceObj.performVerifyPaymentAgencyCvRechargeOrderActivities(validatedRequestBody);
         res.status(HttpStatusCode.OK_200).json(response);
      } catch (error) {
         global.logger.error(`Verify Payment Agency Cv Recharge Order [Controller]`, {
            methodName: this.verifyPaymentAgencyCvRechargeOrder.name,
            error,
         });
         next(error);
      }
   }
}

export default AgencyCvRechargeOrderController;