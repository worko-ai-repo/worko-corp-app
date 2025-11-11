
// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { AgencyUserInviteCreateApiDto, AgencyUserInviteListingFilterOptions, AgencyUserInviteListingFilterRequestDTO, AgencyUserInviteCorpUpdateApiDto, AgencyUserInviteAgencyUpdateApiDto } from "../dtos/AgencyUserInvite.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import models
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";

// Import services
import { agencyUserInviteServiceObj } from "../services/AgencyUserInvite.service";

// Import schemas
import { agencyUserInviteCreateApiValidationDto, agencyUserInviteFilterDtoValidation, agencyUserInviteCorpUpdateApiValidationDto, agencyUserInviteAgencyUpdateApiValidationDto } from "../schemas/AgencyUserInvite.schema";

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
  
      const agencyUserInviteDetails: DbAgencyUserInviteDto = await agencyUserInviteServiceObj.performCreateAgencyUserInviteActivities(
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

      const agencyUserInviteListingFilterRequest: AgencyUserInviteListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyUserInviteListingFilterRequestDTO,
          AgencyUserInviteListingFilterOptions
        >(req.query as unknown as AgencyUserInviteListingFilterRequestDTO);

      let { error, value: agencyUserInviteFilterOptions } = agencyUserInviteFilterDtoValidation.validate(
        agencyUserInviteListingFilterRequest,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const jobDetails: GcpFirestoreRecordListingResponseDTO<DbAgencyUserInviteDto[]> =
        await agencyUserInviteServiceObj.performGetAllAgencyUserInviteActivities(
          agencyUserInviteFilterOptions
        );

      res.status(HttpStatusCode.OK_200).json(jobDetails);
      
    } catch (error) {
      global.logger.error(`Get All Agency User Invites By Filter Options [Controller]`, {
        methodName: this.getAllAgencyUserInvitesByFilterOptions.name,
        error,
      });
      next(error);
    }
  }

  getAgencyUserInviteById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get Agency User Invites By Id [Controller]`, {
        methodName: this.getAgencyUserInviteById.name,
      });

      const { id } = req.params;

      const agencyUserInviteDetails: DbAgencyUserInviteDto | undefined = await agencyUserInviteServiceObj.getAgencyUserInviteById(
        id
      );

      if(!agencyUserInviteDetails) {
        global.logger.error(`Agency User Invite not found [Controller]`, {
          methodName: this.getAgencyUserInviteById.name,
          invalidInviteId: id
        });
        throw new BaseError("Agency User Invite not found", HttpStatusCode.NOT_FOUND_404);
      }

      res.status(HttpStatusCode.OK_200).json(agencyUserInviteDetails);
    } catch (error) {
      global.logger.error(`Get Agency User Invite By Id [Controller]`, {
        inviteId: req.params.id,
        methodName: this.getAgencyUserInviteById.name,
        error,
      });
      next(error);
    }
  };

  updateAgencyUserInviteByCorpUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Update Agency User Invite [Controller]`, {
        methodName: this.updateAgencyUserInviteByCorpUser.name,
      });

      const requestBody: AgencyUserInviteCorpUpdateApiDto = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyUserInviteCorpUpdateApiValidationDto.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const agencyUserInviteDetails: DbAgencyUserInviteDto = await agencyUserInviteServiceObj.performUpdateAgencyUserInviteActivitiesByCorpUser(
        validatedRequestBody
      );

      res.status(HttpStatusCode.OK_200).json(agencyUserInviteDetails);
    } catch (error) {
      global.logger.error(`Update Agency User Invite [Controller]`, {
        methodName: this.updateAgencyUserInviteByCorpUser.name,
        error,
      });
      next(error);
    }
  };

  updateAgencyUserInviteByAgencyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Agency User Invite Update By Agency User [Controller]`, {
        methodName: this.updateAgencyUserInviteByAgencyUser.name,
      });

      const requestBody: AgencyUserInviteAgencyUpdateApiDto = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyUserInviteAgencyUpdateApiValidationDto.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const agencyUserInviteDetails: DbAgencyUserInviteDto = await agencyUserInviteServiceObj.performUpdateAgencyUserInviteActivitiesByAgencyUser(
        validatedRequestBody
      );

      res.status(HttpStatusCode.OK_200).json(agencyUserInviteDetails);
    } catch (error) {
      global.logger.error(`Update Agency User Invite [Controller]`, {
        methodName: this.updateAgencyUserInviteByAgencyUser.name,
        error,
      });
      next(error);
    }
  };
}

export default AgencyUserInviteController;