// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { CorporateCandidateProfileListingFilterOptions, CorporateCandidateProfileListingFilterRequestDTO } from "../dtos/CorporateCandidateProfile.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import services
import { corporateCandidateProfileServiceObj } from "../services/CorporateCandidateProfile.service";

// Import schemas
import { corporateCandidateProfileFilterDtoValidation } from "../schemas/CorporateCandidateProfile.schema";

// Import models
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class CorporateCandidateProfileController {
  getAllCorporateCandidateProfileByFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const corporateCandidateProfileListingFilterRequest: CorporateCandidateProfileListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          CorporateCandidateProfileListingFilterRequestDTO,
          CorporateCandidateProfileListingFilterOptions
        >(req.query as unknown as CorporateCandidateProfileListingFilterRequestDTO);

      let { error, value: validatedRequestBody } = corporateCandidateProfileFilterDtoValidation.validate(
        corporateCandidateProfileListingFilterRequest,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: GcpFirestoreRecordListingResponseDTO<
        (DbCorporateCandidateProfileDto & {
          candidateParsedCvDetails?: DbCandidateParsedCvDto;
        })[]
      > =
        await corporateCandidateProfileServiceObj.performGetAllCorporateCandidateProfileActivities(
          validatedRequestBody
        );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get All Corporate Candidate Profile By Filter Options [Controller]`, {
        methodName: this.getAllCorporateCandidateProfileByFilterOptions.name,
        error,
      })
      next(error);
    }
  }
}

export default CorporateCandidateProfileController;