// Import express packages
import { Request, Response, NextFunction } from "express";

// Import lambda
import { APIGatewayProxyResult } from "aws-lambda";

// Import dtos
import { CandidateParsedCvAdminEmbeddingListingFilterOptions, CandidateParsedCvAdminEmbeddingListingFilterRequestDTO, CandidateParsedCvBulkFindMatchingScoreApiDto, CandidateParsedCvCorpEmbeddingListingFilterOptions, CandidateParsedCvCorpEmbeddingListingFilterRequestDTO, CandidateParsedCvFindMatchingScoreApiDto, CandidateParsedCvParseSubmitFormApiDto, CandidateParsedCvParseSubmitFormResponseDto, CandidateParsedCvSubmitFormCreateApiDto, CandidateParsedCvUpdateApiDto, DuplicateJobApplicantBulkCandidateParsedCvApiDTO, MoveToApplicantBulkCandidateParsedCvCreateApiDTO, MoveToApplicantCandidateParsedCvCreateApiDTO, MoveToApplicantSubmitFormCandidateParsedCvCreateApiDTO } from "../dtos/CandidateParsedCv.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import { PaginatedResultsWithMatchingConditionsInternalResponse } from "../dtos/Common.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";
import { getActionByUserId } from "../helpers/user.helper";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbUserJobApplicationDto } from "../db/aws-dynamodb-models/UserJobApplication.model";
import { DbCandidateJobMatchingDto } from "../db/gcp-firestore-models/CandidateJobMatching.model";

// Import services
import { candidateParsedCvServiceObj } from "../services/CandidateParsedCv.service";

// Import schemas
import { candidateParsedCvAdminEmbeddingFilterDtoValidation, candidateParsedCvBulkFindMatchingScoreApiValidationDto, candidateParsedCvCorpEmbeddingFilterDtoValidation, candidateParsedCvFindMatchingScoreApiValidationDto, candidateParsedCvParseSubmitFormApiValidationDto, candidateParsedCvUpdateApiValidationDto, duplicateJobApplicantBulkCandidateParsedCvApiDtoValidation, moveToApplicantBulkCandidateParsedCvCreateApiDtoValidation, moveToApplicantCandidateParsedCvCreateApiDtoValidation } from "../schemas/CandidateParsedCv.schema";

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
      > = await candidateParsedCvServiceObj.performGetAllCandidateParsedCvByCorpEmbeddingActivities(
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

  getAllCandidateParsedCvByAdminEmbeddingFilterOptions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const candidateParsedCvListingFilterRequest: CandidateParsedCvAdminEmbeddingListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          CandidateParsedCvAdminEmbeddingListingFilterRequestDTO,
          CandidateParsedCvAdminEmbeddingListingFilterOptions
        >(
          req.query as unknown as CandidateParsedCvAdminEmbeddingListingFilterRequestDTO
        );

      let { error, value: validatedRequestBody } =
        candidateParsedCvAdminEmbeddingFilterDtoValidation.validate(
          candidateParsedCvListingFilterRequest,
          { abortEarly: false }
        );
      if (error) {
        throw new RequestValidationError(error);
      }
      const response: GcpFirestoreRecordListingResponseDTO<
        DbCandidateParsedCvDto[]
      > = await candidateParsedCvServiceObj.performGetAllCandidateParsedCvByAdminEmbeddingActivities(
         validatedRequestBody
      );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Get All Candidate Parsed Cv By Admin embedding Filter Options [Controller]`,
        {
          methodName: this.getAllCandidateParsedCvByAdminEmbeddingFilterOptions.name,
          error,
        }
      );

      next(error);
    }
  }

  parseSubmitFormCandidateParsedCv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqBody: CandidateParsedCvParseSubmitFormApiDto = req.body;

      const { error: reqBodyError, value: validatedReqBody } =
        candidateParsedCvParseSubmitFormApiValidationDto.validate(reqBody, {
          abortEarly: false,
        });

      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const response =
        await candidateParsedCvServiceObj.parseSubmitFormCandidateParsedCvAsync(
          validatedReqBody
        );
      res.status(HttpStatusCode.ACCEPTED_202).json({
        message: "Candidate cv parsing initiated successfully.",
      });
    } catch (error) {
      global.logger.error(`Parse Submit Form Candidate Parsed Cv [Controller]`, {
        methodName: this.parseSubmitFormCandidateParsedCv.name,
        error,
      })
      next(error);
    }
  };

  moveToApplicantCandidateParsedCv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Move To Applicant Candidate Parsed Cv [Controller]`, {
        methodName: this.moveToApplicantCandidateParsedCv.name,
      });

      const reqBody: MoveToApplicantCandidateParsedCvCreateApiDTO = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        moveToApplicantCandidateParsedCvCreateApiDtoValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const { actionByCorporateUserId, actionByUserId } = getActionByUserId();

      if (!actionByUserId && !actionByCorporateUserId) {
        throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
      }

      const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

      const response: DbUserJobApplicationDto = await candidateParsedCvServiceObj.moveToApplicantCandidateParsedCv(
        validatedRequestBody,
        cognitoUserGroups,
        actionByUserId,
        actionByCorporateUserId
      );
      res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      global.logger.error(`Move To Applicant Candidate Parsed Cv [Controller]`,{
        methodName: this.moveToApplicantCandidateParsedCv.name,
        error
      });
      next(error);
    }
  }

  duplicateJobApplicantBulkCandidateParsedCv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqBody: DuplicateJobApplicantBulkCandidateParsedCvApiDTO = req.body;
      const { error: reqBodyError, value: validatedRequestBody } = duplicateJobApplicantBulkCandidateParsedCvApiDtoValidation.validate(reqBody, {
        abortEarly: false,
      })
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }
      const response: PaginatedResultsWithMatchingConditionsInternalResponse<DbUserJobApplicationDto[]> = await candidateParsedCvServiceObj.duplicateJobApplicantBulkCandidateParsedCv(validatedRequestBody);
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Duplicate Job Applicant Bulk Candidate Parsed Cv [Controller]`,{
        methodName: this.duplicateJobApplicantBulkCandidateParsedCv.name,
        error
      });

      next(error);
    }
  }

  moveToApplicantBulkCandidateParsedCv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Move To Applicant Bulk Candidate Parsed Cv [Controller]`, {
        methodName: this.moveToApplicantBulkCandidateParsedCv.name,
      });
      const reqBody: MoveToApplicantBulkCandidateParsedCvCreateApiDTO = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        moveToApplicantBulkCandidateParsedCvCreateApiDtoValidation.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const { actionByCorporateUserId, actionByUserId } = getActionByUserId();

      if (!actionByUserId && !actionByCorporateUserId) {
        throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
      }

      const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;
      const response: APIGatewayProxyResult[] = await candidateParsedCvServiceObj.moveToApplicantBulkCandidateParsedCvAsync(
        validatedRequestBody,
        cognitoUserGroups,
        actionByUserId,
        actionByCorporateUserId
      );
      res.status(HttpStatusCode.ACCEPTED_202).json({
        message: "Bulk Move to applicant process initiated successfully.",
      }); 
    } catch (error) {
      global.logger.error(`Move To Applicant Bulk Candidate Parsed Cv [Controller]`,{
        methodName: this.moveToApplicantBulkCandidateParsedCv.name,
        error
      });
      next(error);
    }
  }

  findMatchingScoreCandidateParsedCv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqBody: CandidateParsedCvFindMatchingScoreApiDto = req.body;
      const { error: reqBodyError, value: validatedReqBody } =
        candidateParsedCvFindMatchingScoreApiValidationDto.validate(reqBody, {
          abortEarly: false,
        });

      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }
      const response: {
        candidateJobMatchingId?: string
      } | DbCandidateJobMatchingDto | DbUserJobApplicationDto = await candidateParsedCvServiceObj.findMatchingScoreCandidateParsedCv(
        validatedReqBody
      );
      if("candidateJobMatchingId" in response) {
        return res.status(HttpStatusCode.ACCEPTED_202).json({ 
          candidateJobMatchingId: response.candidateJobMatchingId,
          message: "Matching score process initiated." 
        });
      } else if("id" in response) {
        return res.status(HttpStatusCode.OK_200).json(response);
      } else {
        global.logger.error(`Failed to find matching score [Controller].`, {
          methodName: this.findMatchingScoreCandidateParsedCv.name,
          response
        });
        throw new BaseError("Failed to find matching score.", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }
    } catch (error) {
      global.logger.error(`Find Matching Score Candidate Parsed Cv [Controller]`, {
        methodName: this.findMatchingScoreCandidateParsedCv.name,
        error,
      })
      next(error);
    }
  }

  findMatchingScoreBulkCandidateParsedCv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqBody: CandidateParsedCvBulkFindMatchingScoreApiDto = req.body;
      const { error: reqBodyError, value: validatedReqBody } =
        candidateParsedCvBulkFindMatchingScoreApiValidationDto.validate(reqBody, {
          abortEarly: false,
        });

      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }
      const response: {
        existingCandidateJobMatchingScores: ({
          candidateParsedCvId: string;
        } & (
          | Partial<DbCandidateJobMatchingDto>
          | Partial<DbUserJobApplicationDto>
        ))[];
        initiatedCandidateJobMatchingScores: {
          candidateParsedCvId: string;
          candidateJobMatchingId: string;
        }[];
        failedCandidateJobMatchingScores: {
          candidateParsedCvId: string;
          error?: string;
        }[];
      } =
        await candidateParsedCvServiceObj.performFindMatchingScoreBulkCandidateParsedCv(
          validatedReqBody,
        );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Find Matching Score Bulk Candidate Parsed Cv [Controller]`, {
        methodName: this.findMatchingScoreBulkCandidateParsedCv.name,
        error
      })

      next(error);
    }
  }

  updateCandidateParsedCvById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reqBody: CandidateParsedCvUpdateApiDto = req.body;
      const { error: reqBodyError, value: validatedReqBody } =
        candidateParsedCvUpdateApiValidationDto.validate(reqBody, {
          abortEarly: false,
        });
      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }
      const response: DbCandidateParsedCvDto = await candidateParsedCvServiceObj.performUpdateCandidateParsedCv(
        req.params.id,
        validatedReqBody
      );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Update Candidate Parsed Cv By Id [Controller]`, {
        methodName: this.updateCandidateParsedCvById.name,
        error
      })

      next(error);
    }
  }
}

export default CandidateParsedCvController;
