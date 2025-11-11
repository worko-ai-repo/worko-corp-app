// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { AgencyUserCreateApiDto } from "../dtos/AgencyUser.dto";

// Import helpers
import { getActionByAgencyUserIds } from "../helpers/user.helper";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

// Import services
import { agencyUserServiceObj } from "../services/AgencyUser.service";
import UlidService from "../services/Ulid.service";

// Import schemas
import { agencyUserCreateApiValidationDto } from "../schemas/AgencyUser.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class AgencyUserController {
  createAgencyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requestBody: AgencyUserCreateApiDto = req.body;

      const { error: reqBodyError, value: validatedRequestBody } =
        agencyUserCreateApiValidationDto.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const agencyUserDetails: DbAgencyUserDto = await agencyUserServiceObj.performCreateAgencyUserActivities(
        validatedRequestBody
      );
      
      res.status(HttpStatusCode.CREATED_201).json(agencyUserDetails);
    } catch (error) {
      global.logger.error(`Create Agency User [Controller]`, {
        methodName: this.createAgencyUser.name,
        error,
      });

      next(error);
    }
  };

  getAgencyUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Get Agency User By Id [Controller]`, {
        methodName: this.getAgencyUserById.name,
      });
      const id: string = req.params.id;

      const {agencyCognitoUserId, convertedAgencyCognitoUserId} = getActionByAgencyUserIds();

      if(id !== convertedAgencyCognitoUserId) {
        global.logger.error(`Converted Cognito User Id and Requested User Id are not matching. [Controller]`, {
          methodName: this.getAgencyUserById.name,
          id,
          convertedAgencyCognitoUserId,
          agencyCognitoUserId
        });
        throw new BaseError("You are not allowed to access this resource.", HttpStatusCode.FORBIDDEN_403);
      } 

      const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.getAgencyUserById(id);

      if(!agencyUserDetails) {
        global.logger.error(`Agency User Details not found. [Controller]`, {
          methodName: this.getAgencyUserById.name,
          agencyUserDetails,
        });
        throw new BaseError("Agency User Details not found.", HttpStatusCode.NOT_FOUND_404);
      }
      
      res.status(HttpStatusCode.OK_200).json(agencyUserDetails);
    } catch (error) {
      global.logger.error(`Get Agency User By Id [Controller]`, {
        methodName: this.getAgencyUserById.name,
        error,
      });      
      next(error);
    }
  }

  getAgencyUserByCognitoUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Get Agency User By Cognito User Id [Controller]`, {
        methodName: this.getAgencyUserByCognitoUserId.name,
      });
      const agencyCognitoUserId: string = global.requestLocalContext.userId;
      const requestedAgencyCognitoUserId: string = req.params.id;
      if(agencyCognitoUserId !== requestedAgencyCognitoUserId) {
        global.logger.error(`Cognito User Id and Requested User Id are not matching. [Controller]`, {
          methodName: this.getAgencyUserByCognitoUserId.name,
          agencyCognitoUserId,
          requestedAgencyCognitoUserId,
        });
        throw new BaseError("You are not allowed to access this resource.", HttpStatusCode.FORBIDDEN_403);
      }

      const agencyUserId: string = UlidService.convertUuidToUlid(requestedAgencyCognitoUserId);

      const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.getAgencyUserById(agencyUserId);

      if(!agencyUserDetails) {
        global.logger.error(`Agency User Details not found. [Controller]`, {
          methodName: this.getAgencyUserByCognitoUserId.name,
          agencyUserDetails,
        });
        throw new BaseError("Agency User Details not found.", HttpStatusCode.NOT_FOUND_404);
      }
      
      res.status(HttpStatusCode.OK_200).json(agencyUserDetails);
    } catch (error) {
      global.logger.error(`Get Agency User By Cognito User Id [Controller]`, {
        methodName: this.getAgencyUserByCognitoUserId.name,
        error,
      });      
      next(error);
    }
  }
}

export default AgencyUserController;