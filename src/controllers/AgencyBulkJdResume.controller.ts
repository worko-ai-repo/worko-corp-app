// Import Base Express Params and Types
import { Request, Response, NextFunction } from "express";

// Import DTOs
import {
  AgencyBulkJdResumeCreateApiDto,
  AgencyBulkJdResumeCreateResponseDto,
  AgencyBulkJdResumeFilterOptions,
  AgencyBulkJdResumeFilterRequestDTO,
} from "../dtos/AgencyBulkJdResume.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbAgencyBulkJdResumeDto } from "../db/gcp-firestore-models/AgencyBulkJdResume.model";

// Import Services
import { agencyBulkJdResumeServiceObj } from "../services/AgencyBulkJdResume.service";
import { agencyUserServiceObj } from "../services/AgencyUser.service";

// Import Schemas
import {
  agencyBulkJdResumeDTOValidation,
  agencyBulkJdResumeFilterDtoValidation,
} from "../schemas/AgencyBulkJdResume.schema";

// Import Utils
import { BaseError, RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * AgencyBulkJdResumeController
 *
 * Controller for handling Agency Bulk JD Resume related operations
 */
class AgencyBulkJdResumeController {
  /**
   * createAgencyBulkJdResumes
   *
   * This function is used to create new Agency Bulk JD Resumes
   * and generate pre-signed urls for bulk cvs
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  createAgencyBulkJdResumes = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Logger
      global.logger.info(
        "Processing request for Creating Agency Bulk JD Resumes. [CONTROLLER]",
        {
          methodName: this.createAgencyBulkJdResumes.name,
          agencyBulkJdId: req.body.agencyBulkJdId,
        }
      );

      const agencyBulkJdId: string = req.params.id;

      // Retrieve the Request Body and validate the agency bulk jd resume data from request body and throw error if not valid
      const requestBody: AgencyBulkJdResumeCreateApiDto = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyBulkJdResumeDTOValidation.validate(requestBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      // Send to the Service
      const agencyBulkJdResumeDetails: AgencyBulkJdResumeCreateResponseDto =
        await agencyBulkJdResumeServiceObj.createAgencyBulkJdResumes(
          agencyBulkJdId,
          validatedRequestBody
        );

      // return the Response
      return res
        .status(HttpStatusCode.CREATED_201)
        .json(agencyBulkJdResumeDetails);
    } catch (error) {
      global.logger.error(
        `Create Agency Bulk JD Resumes [Controller]`,
        {
          methodName: this.createAgencyBulkJdResumes.name,
          error,
        }
      )
      next(error);
    }
  };

  /**
   * getAllAgencyBulkJdResumesByFilterOptions
   *
   * This function is used to get all Agency Bulk JD Resumes
   *
   * @param {Request} req - The Request Object
   * @param {Response} res - The Response Object
   * @param {NextFunction} next - The Next Function
   */
  getAllAgencyBulkJdResumesByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Get all Agency Bulk JD Resumes By Filter Options`, {
        filePath: __filename,
        methodName: this.getAllAgencyBulkJdResumesByFilterOptions.name,
      });

      // Parse filter options from the request query parameters
      const agencyBulkJdResumeRecordListingFilterRequest: AgencyBulkJdResumeFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyBulkJdResumeFilterRequestDTO,
          AgencyBulkJdResumeFilterOptions
        >(req.query as unknown as AgencyBulkJdResumeFilterRequestDTO);

      // Validate the request body using the Joi schema and throw a validation error if not valid
      const { error: reqBodyError, value: filterOptions } =
        agencyBulkJdResumeFilterDtoValidation.validate(
          agencyBulkJdResumeRecordListingFilterRequest,
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

      // Fetch the agency bulk jd resumes from the service
      const agencyBulkJdResumes: GcpFirestoreRecordListingResponseDTO<DbAgencyBulkJdResumeDto[]> =
        await agencyBulkJdResumeServiceObj.getAllAgencyBulkJdResumesByFilterOptions(
          filterOptions,
          agencyUserDetails
        );

      // Send the fetched result as JSON response
      return res.status(HttpStatusCode.OK_200).json(agencyBulkJdResumes);
    } catch (error) {
      next(error);
    }
  };

  getAgencyBulkJdResumeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resumeId: string = req.params.id;
      const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.validateAgencyUserAuthAccess();
      if(!agencyUserDetails){
        throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
      }

      const resumeDetails: DbAgencyBulkJdResumeDto | undefined = await agencyBulkJdResumeServiceObj.getAgencyBulkJdResumeById(resumeId);
      if(!resumeDetails){
        throw new BaseError("Resume not found", HttpStatusCode.NOT_FOUND_404);
      }

      if(resumeDetails.createdByAgencyUserId !== agencyUserDetails.id){
        throw new BaseError("Unauthorized", HttpStatusCode.UNAUTHORIZED_401);
      }
      return res.status(HttpStatusCode.OK_200).json(resumeDetails);
    } catch (error) {
      next(error);
    }
  };
}

// Export Default Controller
export default AgencyBulkJdResumeController;
