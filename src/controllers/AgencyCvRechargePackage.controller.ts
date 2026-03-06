// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import {
  AgencyCvRechargePackageCreateApiDto,
  AgencyCvRechargePackageListingFilterOptions,
  AgencyCvRechargePackageListingFilterRequestDTO,
} from "../dtos/AgencyCvRechargePackage.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import models
import { DbAgencyCvRechargePackageDto } from "../db/gcp-firestore-models/AgencyCvRechargePackage.model";

// Import schemas
import {
  agencyCvRechargePackageCreateApiValidationDto,
  agencyCvRechargePackageFilterDtoValidation,
} from "../schemas/AgencyCvRechargePackage.schema";

// Import services
import { agencyCvRechargePackageServiceObj } from "../services/AgencyCvRechargePackage.service";

// Import utils
import { RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyCvRechargePackageController {
  createAgencyCvRechargePackage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const requestBody: AgencyCvRechargePackageCreateApiDto = req.body;

      const { error: reqBodyError, value: validatedRequestBody } =
        agencyCvRechargePackageCreateApiValidationDto.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const response =
        await agencyCvRechargePackageServiceObj.createAgencyCvRechargePackage(
          validatedRequestBody,
        );

      res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      global.logger.error(`Create Agency Cv Recharge Package [Controller]`, {
        methodName: this.createAgencyCvRechargePackage.name,
        error,
      });

      next(error);
    }
  };

  getAgencyCvRechargePackageByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const filterRequest: AgencyCvRechargePackageListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyCvRechargePackageListingFilterRequestDTO,
          AgencyCvRechargePackageListingFilterOptions
        >(
          req.query as unknown as AgencyCvRechargePackageListingFilterRequestDTO,
        );

      let { error, value: validatedRequestBody } =
        agencyCvRechargePackageFilterDtoValidation.validate(filterRequest, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: GcpFirestoreRecordListingResponseDTO<
        DbAgencyCvRechargePackageDto[]
      > =
        await agencyCvRechargePackageServiceObj.getAllAgencyCvRechargePackageByFilterOptions(
          validatedRequestBody,
        );

      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Get Agency Cv Recharge Package By Filter Options [Controller]`,
        {
          methodName: this.getAgencyCvRechargePackageByFilterOptions.name,
          error,
        },
      );

      next(error);
    }
  };
}

export default AgencyCvRechargePackageController;
