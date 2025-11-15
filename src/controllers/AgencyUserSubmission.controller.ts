// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { AgencyUserSubmissionCandidateParseCvApiDto, AgencyUserSubmissionCandidateParseCvResponseDto, AgencyUserSubmissionCreateApiDto, AgencyUserSubmissionListingFilterOptions, AgencyUserSubmissionListingFilterRequestDTO } from "../dtos/AgencyUserSubmission.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import models
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";

// Import services
import { agencyUserSubmissionServiceObj } from "../services/AgencyUserSubmission.service";

// Import schemas
import { agencyUserSubmissionCandidateParseCvApiValidationDto, agencyUserSubmissionCreateApiValidationDto, agencyUserSubmissionFilterDtoValidation } from "../schemas/AgencyUserSubmission.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

class AgencyUserSubmissionController {
  parseAgencyUserSubmissionCandidateCv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqBody: AgencyUserSubmissionCandidateParseCvApiDto = req.body;

      const { error: reqBodyError, value: validatedReqBody } =
        agencyUserSubmissionCandidateParseCvApiValidationDto.validate(reqBody, {
          abortEarly: false,
        });

      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const response: AgencyUserSubmissionCandidateParseCvResponseDto =
        await agencyUserSubmissionServiceObj.parseAgencyUserSubmissionCandidateCv(
          validatedReqBody
        );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Parse Agency User Submission Candidate CV [Controller]`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        error,
      })
      next(error);
    }
  };

  createAgencyUserSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqBody: AgencyUserSubmissionCreateApiDto = req.body;

      const { error: reqBodyError, value: validatedReqBody } =
        agencyUserSubmissionCreateApiValidationDto.validate(reqBody, {
          abortEarly: false,
        });

      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }
      const response: DbAgencyUserSubmissionDto =
        await agencyUserSubmissionServiceObj.performCreateAgencyUserSubmissionActivities(
          validatedReqBody
        );
      
      res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      global.logger.error(`Create Agency User Submission [Controller]`, {
        methodName: this.createAgencyUserSubmission.name,
        error,
      })
      next(error);
    }
  };

  getAllAgencyUserSubmissionByFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const agencyUserSubmissionListingFilterRequest: AgencyUserSubmissionListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyUserSubmissionListingFilterRequestDTO,
          AgencyUserSubmissionListingFilterOptions
        >(req.query as unknown as AgencyUserSubmissionListingFilterRequestDTO);

      let { error, value: validatedRequestBody } = agencyUserSubmissionFilterDtoValidation.validate(
        agencyUserSubmissionListingFilterRequest,
        { abortEarly: false }
      );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: GcpFirestoreRecordListingResponseDTO<
        (DbAgencyUserSubmissionDto & {
          jobDetails?: DbJobAwsOpensearchDto;
          candidateParsedCvDetails?: DbCandidateParsedCvDto;
        })[]
      > =
        await agencyUserSubmissionServiceObj.performGetAllAgencyUserSubmissionActivities(
          validatedRequestBody
        );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get All Agency User Submission By Filter Options [Controller]`, {
        methodName: this.getAllAgencyUserSubmissionByFilterOptions.name,
        error,
      })
      next(error);
    }
  };
}

export default AgencyUserSubmissionController;