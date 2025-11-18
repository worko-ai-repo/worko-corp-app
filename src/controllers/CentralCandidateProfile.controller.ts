// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { CentralCandidateProfileListingFilterOptions, CentralCandidateProfileListingFilterRequestDTO } from "../dtos/CentralCandidateProfile.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import services
import { centralCandidateProfileServiceObj } from "../services/CentralCandidateProfile.service";

// Import schemas
import { centralCandidateProfileFilterDtoValidation } from "../schemas/CentralCandidateProfile.schema";

// Import models
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

class CentralCandidateProfileController {
  getAllCentralCandidateProfileByFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const centralCandidateProfileListingFilterRequest: CentralCandidateProfileListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          CentralCandidateProfileListingFilterRequestDTO,
          CentralCandidateProfileListingFilterOptions
        >(req.query as unknown as CentralCandidateProfileListingFilterRequestDTO);

      let { error, value: validatedRequestBody } = centralCandidateProfileFilterDtoValidation.validate(
        centralCandidateProfileListingFilterRequest,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: GcpFirestoreRecordListingResponseDTO<
        (DbCentralCandidateProfileDto & {
          candidateParsedCvDetails?: DbCandidateParsedCvDto;
        })[]
      > =
        await centralCandidateProfileServiceObj.performGetAllCentralCandidateProfileActivities(
          validatedRequestBody
        );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get All Central Candidate Profile By Filter Options [Controller]`, {
        methodName: this.getAllCentralCandidateProfileByFilterOptions.name,
        error,
      })
      next(error);
    }
  }
}

export default CentralCandidateProfileController;