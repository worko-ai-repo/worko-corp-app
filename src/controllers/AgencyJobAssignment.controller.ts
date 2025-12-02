// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { AgencyJobAssignmentBulkCreateApiDto, AgencyJobAssignmentBulkRemoveJobsUpdateApiDto, AgencyJobAssignmentListingFilterOptions, AgencyJobAssignmentListingFilterRequestDTO } from "../dtos/AgencyJobAssignment.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import models
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";

// Import services
import { agencyJobAssignmentServiceObj } from "../services/AgencyJobAssignment.service";

// Import schemas
import { agencyJobAssignmentBulkCreateApiDtoValidation, agencyJobAssignmentBulkRemoveJobsUpdateApiDtoValidation, agencyJobAssignmentFilterDtoValidation } from "../schemas/AgencyJobAssignment.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

class AgencyJobAssignmentController {
  createBulkAgencyJobAssignment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const requestBody: AgencyJobAssignmentBulkCreateApiDto = req.body;

      let { error, value: validatedRequestBody } = agencyJobAssignmentBulkCreateApiDtoValidation.validate(
        requestBody,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const agencyJobAssignmentDetails: boolean = await agencyJobAssignmentServiceObj.performCreateBulkAgencyJobAssignmentActivities(
        validatedRequestBody
      );

      res.status(HttpStatusCode.CREATED_201).json({
        isSuccess: agencyJobAssignmentDetails,
      });
    } catch (error) {
      global.logger.error(`Create Bulk Agency Job Assignment [Controller]`, {
        methodName: this.createBulkAgencyJobAssignment.name,
        error,
      })

      next(error);
    }
  };

  removeBulkAgencyJobAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestBody: AgencyJobAssignmentBulkRemoveJobsUpdateApiDto = req.body;

      let { error, value: validatedRequestBody } = agencyJobAssignmentBulkRemoveJobsUpdateApiDtoValidation.validate(
        requestBody,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const agencyJobAssignmentDetails: boolean = await agencyJobAssignmentServiceObj.removeBulkAgencyJobAssignment(
        validatedRequestBody
      );

      res.status(HttpStatusCode.OK_200).json({
        isSuccess: agencyJobAssignmentDetails,
      });

    } catch (error) {
      global.logger.error(`Remove Bulk Agency Job Assignment [Controller]`, {
        methodName: this.removeBulkAgencyJobAssignment.name,
        error,
      });

      next(error);
    }
  };

  getAllAgencyJobAssignmentByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const agencyJobAssignmentListingFilterRequest: AgencyJobAssignmentListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyJobAssignmentListingFilterRequestDTO,
          AgencyJobAssignmentListingFilterOptions
        >(req.query as unknown as AgencyJobAssignmentListingFilterRequestDTO);

      let { error, value: agencyJobAssignmentFilterOptions } = agencyJobAssignmentFilterDtoValidation.validate(
        agencyJobAssignmentListingFilterRequest,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const jobDetails: GcpFirestoreRecordListingResponseDTO<
        (DbAgencyJobAssignmentDto & {
          jobDetails?: DbJobAwsOpensearchDto;
        })[]
      > =
        await agencyJobAssignmentServiceObj.performGetAllAgencyJobAssignmentsActivities(
          agencyJobAssignmentFilterOptions
        );

      res.status(HttpStatusCode.OK_200).json(jobDetails);
    } catch (error) {
      global.logger.error(`Get All Agency Job Assignment [Controller]`, {
        methodName: this.getAllAgencyJobAssignmentByFilterOptions.name,
        error,
      })

      next(error);
    }
  };
}

export default AgencyJobAssignmentController;