// Import Base Express Params and Types
import { Request, Response, NextFunction } from "express";

// Import DTOs
import {
  AgencyBulkJdCreateApiDto,
  AgencyBulkJdFilterOptions,
  AgencyBulkJdFilterRequestDTO,
} from "../dtos/AgencyBulkJd.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// import models
import { DbAgencyBulkJdDto } from "../db/gcp-firestore-models/AgencyBulkJd.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

// Import Services
import { agencyBulkJdServiceObj } from "../services/AgencyBulkJd.service";
import { agencyUserServiceObj } from "../services/AgencyUser.service";

// Import Schemas
import {
  agencyBulkJdDTOValidation,
  agencyBulkJdFilterDtoValidation,
} from "../schemas/AgencyBulkJd.schema";

// Import Utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * AgencyBulkJdController
 *
 * Controller for handling Agency Bulk Job Description related operations
 */
class AgencyBulkJdController {
  /**
   * createAgencyBulkJd
   *
   * This function is used to create a new Agency Bulk Job Description
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  createAgencyBulkJd = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Logger
      global.logger.info(
        "Processing request for Creating Agency Bulk Job Description. [CONTROLLER]",
        {
          methodName: this.createAgencyBulkJd.name,
          companyId: req.body.companyId,
        }
      );

      // Retrieve the Request Body and validate the agency bulk jd data from request body and throw error if not valid
      const requestBody: AgencyBulkJdCreateApiDto = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyBulkJdDTOValidation.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Send to the Service
      const agencyBulkJdDetails: DbAgencyBulkJdDto | undefined =
        await agencyBulkJdServiceObj.performCreateAgencyBulkJdApiActivities(
          validatedRequestBody,
        );

      // return the Response
      return res.status(HttpStatusCode.CREATED_201).json(agencyBulkJdDetails);
    } catch (error) {
      global.logger.error(
        "Error while processing request for Creating Agency Bulk Job Description. [CONTROLLER]",
        {
          methodName: this.createAgencyBulkJd.name,
          error,
        }
      )
      next(error);
    }
  };

  /**
   * getAllAgencyBulkJdByFilterOptions
   *
   * This function is used to get all Agency Bulk Job Description
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getAllAgencyBulkJdByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get all Agency Bulk Jd By Filter Options`, {
        filePath: __filename,
        methodName: this.getAllAgencyBulkJdByFilterOptions.name,
      });

      // Parse filter options from the request query parameters
      const agencyBulkJdRecordListingFilterRequest: AgencyBulkJdFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyBulkJdFilterRequestDTO,
          AgencyBulkJdFilterOptions
        >(req.query as unknown as AgencyBulkJdFilterRequestDTO);

      // Validate the request body using the Joi schema and throw a validation error if not valid
      const { error: reqBodyError, value: filterOptions } =
        agencyBulkJdFilterDtoValidation.validate(
          agencyBulkJdRecordListingFilterRequest,
          {
            abortEarly: false,
          }
        );
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.validateAgencyUserAuthAccess();
      if(!agencyUserDetails){
        throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
      }

      // Fetch the agency bulk job descriptions from the service
      const agencyBulkJds: GcpFirestoreRecordListingResponseDTO<DbAgencyBulkJdDto[]> =
        await agencyBulkJdServiceObj.getAllAgencyBulkJdByFilterOptions(
          filterOptions,
          agencyUserDetails
        );

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(agencyBulkJds);
    } catch (error) {
      global.logger.error(`Get All Agency Bulk Jd By Filter Options [Controller]`, {
        methodName: this.getAllAgencyBulkJdByFilterOptions.name,
        error,
      })
      next(error);
    }
  };

  /**
   * getAgencyBulkJdById
   *
   * This function is used to get Agency Bulk Job Description by id
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getAgencyBulkJdById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get Agency Bulk Jd By Id`, {
        filePath: __filename,
        methodName: this.getAgencyBulkJdById.name,
      });

      // Extract the id from the request parameters
      const agencyBulkJdId: string = req.params.id;

      const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.validateAgencyUserAuthAccess();
      if(!agencyUserDetails){
        throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
      }

      // Fetch the agency bulk job description from the service
      const agencyBulkJdByIdDetails: DbAgencyBulkJdDto | undefined =
        await agencyBulkJdServiceObj.getAgencyBulkJdById(agencyBulkJdId);
      if (!agencyBulkJdByIdDetails) {
        throw new BaseError(
          `Agency Bulk Job Description Details Not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }

      if(agencyBulkJdByIdDetails.createdByAgencyUserId !== agencyUserDetails.id){
        throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
      }

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(agencyBulkJdByIdDetails);
    } catch (error) {
      next(error);
    }
  };
}

// Export Default Controller
export default AgencyBulkJdController;
