
// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { BulkSourceTypeResumeCreateApiDto } from "../services/BulkSourceTypeResume.dto";

// Import schemas
import { bulkSourceTypeResumeCreateApiDtoValidation } from "../schemas/BulkSourceTypeResume.schema";

// Import services
import { bulkSourceTypeResumeServiceObj } from "../services/BulkSourceTypeResume.service";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class BulkSourceTypeResumeController {
  createBulkSourceTypeResume = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const requestBody: BulkSourceTypeResumeCreateApiDto = req.body;
      let { error, value: validatedRequestBody } =
        bulkSourceTypeResumeCreateApiDtoValidation.validate(
          requestBody,
          { abortEarly: false },
        );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response = await bulkSourceTypeResumeServiceObj.createBulkSourceTypeResume(
         validatedRequestBody,
      );
      if(!response) {
        global.logger.error("Create Bulk Source Type Resume Failed - Undefined Response", {
          methodName: this.createBulkSourceTypeResume.name,
          requestBody,
          validatedRequestBody
        });
        throw new BaseError("Failed to create bulk source type resume.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }
      res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      global.logger.error(
        `Create Bulk Source Type Resume [Controller]`,
        {
          methodName:
            this.createBulkSourceTypeResume.name,
          error,
        },
      );
      next(error);
    }
  };

  getBulkSourceTypeResumeById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await bulkSourceTypeResumeServiceObj.getBulkSourceTypeResumeById(req.params.id);
      if(!response) {
        throw new BaseError("Bulk source type resume details not found", HttpStatusCode.NOT_FOUND_404);
      }
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get Bulk Source Type Resume By Id [Controller]`, {
        methodName: this.getBulkSourceTypeResumeById.name,
        error,
      });
      next(error);
    }
  };
}

export default BulkSourceTypeResumeController;
