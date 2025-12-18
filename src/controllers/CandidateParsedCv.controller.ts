// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { CandidateParsedCvCorpEmbeddingListingFilterOptions, CandidateParsedCvCorpEmbeddingListingFilterRequestDTO } from "../dtos/CandidateParsedCv.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Import services
import { candidateParsedCvServiceObj } from "../services/CandidateParsedCv.service";

// Import schemas
import { candidateParsedCvCorpEmbeddingFilterDtoValidation } from "../schemas/CandidateParsedCv.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class CandidateParsedCvController {
  getCandidateParsedCvById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: DbCandidateParsedCvDto | undefined = await candidateParsedCvServiceObj.getCandidateParsedCvById(req.params.id);
      if(!response) {
        throw new BaseError("Candidate parsed cv details not found", HttpStatusCode.NOT_FOUND_404);
      }
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get Candidate Parsed Cv By Id [Controller]`, {
        methodName: this.getCandidateParsedCvById.name,
        error,
      });

      next(error);
    }
  }

  getAllCandidateParsedCvByCorpEmbeddingFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const candidateParsedCvListingFilterRequest: CandidateParsedCvCorpEmbeddingListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          CandidateParsedCvCorpEmbeddingListingFilterRequestDTO,
          CandidateParsedCvCorpEmbeddingListingFilterOptions
        >(
          req.query as unknown as CandidateParsedCvCorpEmbeddingListingFilterRequestDTO
        );

      let { error, value: validatedRequestBody } =
        candidateParsedCvCorpEmbeddingFilterDtoValidation.validate(
          candidateParsedCvListingFilterRequest,
          { abortEarly: false }
        );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: GcpFirestoreRecordListingResponseDTO<
        DbCandidateParsedCvDto[]
      > = await candidateParsedCvServiceObj.performGetAllCandidateParsedCvByCorporateActivities(
         validatedRequestBody
      );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Get All Candidate Parsed Cv By Corporate Filter Options [Controller]`,
        {
          methodName: this.getAllCandidateParsedCvByCorpEmbeddingFilterOptions.name,
          error,
        }
      );

      next(error);
    }
  };
}

export default CandidateParsedCvController;
