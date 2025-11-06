// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { AgencyJobAssignmentBulkCreateApiDto } from "../dtos/AgencyJobAssignment.dto";

// Import services
import { agencyJobAssignmentServiceObj } from "../services/AgencyJobAssignment.service";

// Import schemas
import { agencyJobAssignmentBulkCreateApiDtoValidation } from "../schemas/AgencyJobAssignment.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

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
}

export default AgencyJobAssignmentController;