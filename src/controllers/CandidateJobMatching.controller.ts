// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { CandidateJobMatchingListingFilterOptions, CandidateJobMatchingListingFilterRequestDTO } from "../dtos/CandidateJobMatching.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import models
import { DbCandidateJobMatchingDto } from "../db/gcp-firestore-models/CandidateJobMatching.model";

// Import schemas
import { candidateJobMatchingFilterDtoValidation } from "../schemas/CandidateJobMatching.schema";

// Import services
import { candidateJobMatchingServiceObj } from "../services/CandidateJobMatching.service";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class CandidateJobMatchingController {
  getCandidateJobMatchingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: DbCandidateJobMatchingDto | undefined = await candidateJobMatchingServiceObj.getCandidateJobMatchingById(req.params.id);
      if(!response) {
        throw new BaseError("Candidate job matching details not found", HttpStatusCode.NOT_FOUND_404);
      }
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get Candidate Job Matching By Id [Controller]`, {
        methodName: this.getCandidateJobMatchingById.name,
        error,
      });

      next(error);
    }
  }

  getAllCandidateJobMatchingByFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const candidateParsedCvListingFilterRequest: CandidateJobMatchingListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          CandidateJobMatchingListingFilterRequestDTO,
          CandidateJobMatchingListingFilterOptions
        >(
          req.query as unknown as CandidateJobMatchingListingFilterRequestDTO,
        );

      let { error, value: validatedRequestBody } =
        candidateJobMatchingFilterDtoValidation.validate(
          candidateParsedCvListingFilterRequest,
          { abortEarly: false }
        );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: GcpFirestoreRecordListingResponseDTO<
        DbCandidateJobMatchingDto[]
      > = await candidateJobMatchingServiceObj.getAllCandidateJobMatchingByFilterOptions(
         validatedRequestBody
      );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get All Candidate Job Matching By Filter Options [Controller]`, {
        methodName: this.getAllCandidateJobMatchingByFilterOptions.name,
        error,
      });

      next(error);
    }
  }
}

export default CandidateJobMatchingController;