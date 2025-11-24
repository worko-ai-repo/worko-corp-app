// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import { CandidateParsedCvCorporateListingFilterOptions, CandidateParsedCvCorporateListingFilterRequestDTO } from "../dtos/CandidateParsedCv.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import services
import { candidateParsedCvServiceObj } from "../services/CandidateParsedCv.service";

// Import schemas
import { candidateParsedCvCorporateFilterDtoValidation } from "../schemas/CandidateParsedCv.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class CandidateParsedCvController {
  getAllCandidateParsedCvByCorporateFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const candidateParsedCvListingFilterRequest: CandidateParsedCvCorporateListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          CandidateParsedCvCorporateListingFilterRequestDTO,
          CandidateParsedCvCorporateListingFilterOptions
        >(
          req.query as unknown as CandidateParsedCvCorporateListingFilterRequestDTO
        );

      let { error, value: validatedRequestBody } =
        candidateParsedCvCorporateFilterDtoValidation.validate(
          candidateParsedCvListingFilterRequest,
          { abortEarly: false }
        );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response = await candidateParsedCvServiceObj.performGetAllCandidateParsedCvByCorporateActivities(
         validatedRequestBody
      );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Get All Candidate Parsed Cv By Corporate Filter Options [Controller]`,
        {
          methodName: this.getAllCandidateParsedCvByCorporateFilterOptions.name,
          error,
        }
      );

      next(error);
    }
  };
}

export default CandidateParsedCvController;
