
// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { AgencyUserInviteCreateApiDto, AgencyUserInviteUpdateApiDto } from "../dtos/AgencyUserInvite.dto";

// Import services
import { agencyUserInviteServiceObj } from "../services/AgencyUserInvite.service";

// Import schemas
import { agencyUserInviteCreateApiValidationDto, agencyUserInviteUpdateApiValidationDto } from "../schemas/AgencyUserInvite.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class AgencyUserInviteController {
  createAgencyUserInvite = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Create Agency User Invite [Controller]`, {
        methodName: this.createAgencyUserInvite.name,
      });

      const requestBody: AgencyUserInviteCreateApiDto = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyUserInviteCreateApiValidationDto.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }
  
      const agencyUserInviteDetails = await agencyUserInviteServiceObj.performCreateAgencyUserInviteActivities(
        validatedRequestBody
      );

      res.status(HttpStatusCode.CREATED_201).json(agencyUserInviteDetails);
    } catch (error) {
      global.logger.error(`Create Agency User Invite [Controller]`, {
        methodName: this.createAgencyUserInvite.name,
        error,
      });
      next(error);
    }
  };

  getAllAgencyUserInvitesByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get All Agency User Invites By Filter Options [Controller]`, {
        methodName: this.getAllAgencyUserInvitesByFilterOptions.name,
      });
      
    } catch (error) {
      global.logger.error(`Get All Agency User Invites By Filter Options [Controller]`, {
        methodName: this.getAllAgencyUserInvitesByFilterOptions.name,
        error,
      });
      next(error);
    }
  }

  updateAgencyUserInvite = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Update Agency User Invite [Controller]`, {
        methodName: this.updateAgencyUserInvite.name,
      });

      const requestBody: AgencyUserInviteUpdateApiDto = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyUserInviteUpdateApiValidationDto.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const agencyUserInviteDetails = await agencyUserInviteServiceObj.performUpdateAgencyUserInviteActivities(
        validatedRequestBody
      );

      res.status(HttpStatusCode.OK_200).json(agencyUserInviteDetails);
    } catch (error) {
      global.logger.error(`Update Agency User Invite [Controller]`, {
        methodName: this.updateAgencyUserInvite.name,
        error,
      });
      next(error);
    }
  };
}

export default AgencyUserInviteController;