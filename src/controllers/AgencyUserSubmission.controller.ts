// Import express packages
import { Request, Response, NextFunction } from "express";

// Import services
import { agencyUserSubmissionServiceObj } from "../services/AgencyUserSubmission.service";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class AgencyUserSubmissionController {
  createAgencyUserSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      res.status(HttpStatusCode.CREATED_201).json({});
    } catch (error) {
      next(error);
    }
  };
}

export default AgencyUserSubmissionController;