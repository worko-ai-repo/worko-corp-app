// Import express packages
import { Request, Response, NextFunction } from "express";

// Import firestore packages
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import dtos
import { CorporateCandidateProfileDuplicationRequestDTO, CorporateCandidateProfileListingFilterOptions, CorporateCandidateProfileListingFilterRequestDTO } from "../dtos/CorporateCandidateProfile.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";
import { getActionByAgencyUserIds } from "../helpers/user.helper";

// Import services
import { corporateCandidateProfileServiceObj } from "../services/CorporateCandidateProfile.service";
import { agencyUserServiceObj } from "../services/AgencyUser.service";

// Import schemas
import { corporateCandidateProfileDuplicationRequestDtoValidation, corporateCandidateProfileFilterDtoValidation } from "../schemas/CorporateCandidateProfile.schema";

// Import models
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

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

  getDuplicateCorporateCandidateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const requestBody = req.query as unknown as CorporateCandidateProfileDuplicationRequestDTO;

      let { error, value: validatedRequestBody } = corporateCandidateProfileDuplicationRequestDtoValidation.validate(
        requestBody,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const {convertedAgencyCognitoUserId} = getActionByAgencyUserIds();

      const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId
      );
      if(!agencyUserDetails) {
        global.logger.error(`Agency user details not found [Controller]`, {
          methodName: this.getDuplicateCorporateCandidateProfile.name,
          convertedAgencyCognitoUserId
        });
        throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
      }

      const response: QuerySnapshot<DocumentData, DocumentData> = await corporateCandidateProfileServiceObj.getDuplicateCorporateCandidateProfile(
        validatedRequestBody.companyId,
        validatedRequestBody.candidateEmailId,
        {
          number: validatedRequestBody.phoneNumber,
          countryCode: validatedRequestBody.phoneCountryCode
        }
      );

      res.status(HttpStatusCode.OK_200).json({
        isDuplicateProfile: !response.empty
      });
    } catch (error) {
      global.logger.error(`Get Duplicate Corporate Candidate Profile [Controller]`, {
        methodName: this.getDuplicateCorporateCandidateProfile.name,
        error,
      })
      next(error);
    }
  }
}

export default CorporateCandidateProfileController;