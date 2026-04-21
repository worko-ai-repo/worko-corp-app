// Import Base Express Params and Types
import { NextFunction, Request, Response } from "express";

// Import DTOs
import {
  AgencyAnalyticsListingFilterOptions,
  AgencyAnalyticsListingFilterRequestDTO,
  AgencyPerformanceMatrixItemDto,
  AgencyRankingItemDto,
} from "../dtos/AgencyAnalytics.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import Services
import { agencyAnalyticsServiceObj } from "../services/AgencyAnalytics.service";

// Import Schemas
import { agencyAnalyticsFilterDtoValidation } from "../schemas/AgencyAnalytics.schema";

// Import Utils
import { RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * AgencyAnalyticsController
 *
 * Controller for agency analytics matrix, ranking and summary APIs.
 */
class AgencyAnalyticsController {
  /**
   * getAgencyPerformanceMatrix
   *
   * Get agency performance matrix per company-agency-role aggregate.
   * The matrix represents the performance of each agency
   * 
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next function.
   */
  getAgencyPerformanceMatrix = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      global.logger.info("Received request to get agency performance matrix. [Controller]", {
        query: req.query,
        methodName: this.getAgencyPerformanceMatrix.name,
        fileName: __filename,
      });

      // Pass the query params through a helper to convert them into valid filter options for listing APIs
      const listingFilterOptions: AgencyAnalyticsListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyAnalyticsListingFilterRequestDTO,
          AgencyAnalyticsListingFilterOptions
        >(req.query as unknown as AgencyAnalyticsListingFilterRequestDTO);

      //Validate by Joi
      const { error, value: validatedFilterOptions } =
        agencyAnalyticsFilterDtoValidation.validate(listingFilterOptions, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      // Send the validated filter to agency service.
      const response: GcpFirestoreRecordListingResponseDTO<
        AgencyPerformanceMatrixItemDto[]
      > = await agencyAnalyticsServiceObj.getAgencyPerformanceMatrix(
        validatedFilterOptions,
      );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * getAgencyRanking
   *
   * Get agency ranking based on accepted/in-process/hired weighted score.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next function.
   */
  getAgencyRanking = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      global.logger.info("Received request to get agency ranking. [Controller]", {
        query: req.query,
        methodName: this.getAgencyRanking.name,
        fileName: __filename,
      });

      const listingFilterOptions: AgencyAnalyticsListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyAnalyticsListingFilterRequestDTO,
          AgencyAnalyticsListingFilterOptions
        >(req.query as unknown as AgencyAnalyticsListingFilterRequestDTO);

      const { error, value: validatedFilterOptions } =
        agencyAnalyticsFilterDtoValidation.validate(listingFilterOptions, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: GcpFirestoreRecordListingResponseDTO<
        AgencyRankingItemDto[]
      > = await agencyAnalyticsServiceObj.getAgencyRanking(validatedFilterOptions);

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      return next(error);
    }
  };

  /**
   * getAgencyPerformanceSummary
   *
   * Get company-level total counters across all agency-role aggregates.
   *
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next function.
   */
  getAgencyPerformanceSummary = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      global.logger.info("Received request to get agency performance summary. [Controller]", {
        query: req.query,
        methodName: this.getAgencyPerformanceSummary.name,
        fileName: __filename,
      });

      const listingFilterOptions: AgencyAnalyticsListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyAnalyticsListingFilterRequestDTO,
          AgencyAnalyticsListingFilterOptions
        >(req.query as unknown as AgencyAnalyticsListingFilterRequestDTO);

      const { error, value: validatedFilterOptions } =
        agencyAnalyticsFilterDtoValidation.validate(listingFilterOptions, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      const response = await agencyAnalyticsServiceObj.getAgencyPerformanceSummary(
        validatedFilterOptions,
      );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      return next(error);
    }
  };
}

export default AgencyAnalyticsController;

