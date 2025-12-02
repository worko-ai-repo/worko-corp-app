// Import express packages
import { Request, Response, NextFunction } from "express";

// Import aws packages
import { APIGatewayProxyResult } from "aws-lambda";

// Import dtos
import { AgencyUserSubmissionBulkFindMatchingScoreApiDto, AgencyUserSubmissionCandidateParseCvApiDto, AgencyUserSubmissionCandidateParseCvResponseDto, AgencyUserSubmissionCreateApiDto, AgencyUserSubmissionFindMatchingScoreApiDto, AgencyUserSubmissionListingFilterOptions, AgencyUserSubmissionListingFilterRequestDTO, AgencyUserSubmissionMoveToApplicantCreateApiDTO, AgencyUserSubmissionRejectApplicantCreateApiDTO, AgencyUserSubmissionSendForEvaluationCreateApiDTO } from "../dtos/AgencyUserSubmission.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import enums
import { InvokeLambdaSourceTypeBulkJdResumeMatchingScoreEntityTypeEnum } from "../enums/InvokeLambda.enum";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";
import { getActionByUserId } from "../helpers/user.helper";

// Import models
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";

// Import services
import { agencyUserSubmissionServiceObj } from "../services/AgencyUserSubmission.service";
import InvokeLambdaService from "../services/InvokeLambda.service";

// Import schemas
import { agencyUserSubmissionBulkFindMatchingScoreApiValidationDto, agencyUserSubmissionCandidateParseCvApiValidationDto, agencyUserSubmissionCreateApiValidationDto, agencyUserSubmissionFilterDtoValidation, agencyUserSubmissionFindMatchingScoreApiValidationDto, agencyUserSubmissionMoveToApplicantCreateApiDtoValidation, agencyUserSubmissionRejectApplicantCreateApiDtoValidation, agencyUserSubmissionSendForEvaluationCreateApiDtoValidation } from "../schemas/AgencyUserSubmission.schema";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

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

  findMatchingScoreAgencyUserSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqBody: AgencyUserSubmissionFindMatchingScoreApiDto = req.body;
      const { error: reqBodyError, value: validatedReqBody } =
        agencyUserSubmissionFindMatchingScoreApiValidationDto.validate(reqBody, {
          abortEarly: false,
        });

      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }
      const response: DbAgencyUserSubmissionDto = await agencyUserSubmissionServiceObj.findMatchingScoreAgencyUserSubmission(
        validatedReqBody
      );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Find Matching Score Agency User Submission [Controller]`, {
        methodName: this.findMatchingScoreAgencyUserSubmission.name,
        error,
      })
      next(error);
    }
  }

  bulkFindMatchingScoreAgencyUserSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info('Bulk Find Matching Score Agency User Submission [Controller] - START');
      const reqBody: AgencyUserSubmissionBulkFindMatchingScoreApiDto = req.body;
      const { error: reqBodyError, value: validatedReqBody } =
        agencyUserSubmissionBulkFindMatchingScoreApiValidationDto.validate(reqBody, {
          abortEarly: false,
        });

      if (reqBodyError) {
        throw new RequestValidationError(reqBodyError);
      }

      const {actionByUserId, actionByCorporateUserId} = getActionByUserId();
      const cognitoUserGroups: string[] = global.requestLocalContext.cognitoUserGroups;

      const response: APIGatewayProxyResult = await InvokeLambdaService.triggerSourceTypeBulkJdResumeMatchingScore(
        {
          entityType: InvokeLambdaSourceTypeBulkJdResumeMatchingScoreEntityTypeEnum.AGENCY_USER_SUBMISSION_FIND_MATCH_SCORE_BULK_JD_RESUME,
          agencyUserSubmissionFindMatchScoreBulkJdResume: {
            agencyUserSubmissionIds: validatedReqBody.agencyUserSubmissionIds,
            actionByUserId,
            actionByCorporateUserId,
            cognitoUserGroups
          }
        }
      )

      res.status(response.statusCode).json({ message: "Bulk matching score processing initiated." });
    } catch (error) {
      global.logger.error(`Bulk Find Matching Score Agency User Submission [Controller]`, {
        methodName: this.bulkFindMatchingScoreAgencyUserSubmission.name,
        error,
      })
      next(error);
    }
  }

  moveToApplicantAgencyUserSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Move To Applicant Agency User Submission [Controller]`, {
        methodName: this.moveToApplicantAgencyUserSubmission.name,
      });

      const reqBody: AgencyUserSubmissionMoveToApplicantCreateApiDTO = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyUserSubmissionMoveToApplicantCreateApiDtoValidation.validate(reqBody, {
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

      const response: DbAgencyUserSubmissionDto =
        await agencyUserSubmissionServiceObj.moveToApplicantAgencyUserSubmission(
          validatedRequestBody,
          cognitoUserGroups,
          actionByUserId,
          actionByCorporateUserId
        );
      res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      global.logger.error(`Move To Applicant Agency User Submission [Controller]`,{
        methodName: this.moveToApplicantAgencyUserSubmission.name,
        error
      });
      next(error);
    }
  }

  sendForEvaluationAgencyUserSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Send For Evaluation Agency User Submission [Controller]`, {
        methodName: this.sendForEvaluationAgencyUserSubmission.name,
      });

      const reqBody: AgencyUserSubmissionSendForEvaluationCreateApiDTO = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyUserSubmissionSendForEvaluationCreateApiDtoValidation.validate(reqBody, {
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

      const response: DbAgencyUserSubmissionDto =
        await agencyUserSubmissionServiceObj.sendForEvaluationAgencyUserSubmission(
          validatedRequestBody,
          cognitoUserGroups,
          actionByUserId,
          actionByCorporateUserId
        );
      res.status(HttpStatusCode.CREATED_201).json(response);
    } catch (error) {
      global.logger.error(`Send For Evaluation Agency User Submission [Controller]`,{
        methodName: this.sendForEvaluationAgencyUserSubmission.name,
        error
      });
      next(error);
    }
  }

  rejectApplicantAgencyUserSubmission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      global.logger.info(`Reject Applicant Agency User Submission [Controller]`, {
        methodName: this.rejectApplicantAgencyUserSubmission.name,
      });

      const reqBody: AgencyUserSubmissionRejectApplicantCreateApiDTO = req.body;
      const { error: reqBodyError, value: validatedRequestBody } =
        agencyUserSubmissionRejectApplicantCreateApiDtoValidation.validate(reqBody, {
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

      const response =
        await agencyUserSubmissionServiceObj.rejectApplicantAgencyUserSubmission(
          validatedRequestBody,
          cognitoUserGroups,
          actionByUserId,
          actionByCorporateUserId
        );
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Reject Applicant Agency User Submission [Controller]`,{
        methodName: this.rejectApplicantAgencyUserSubmission.name,
        error
      });
      next(error);
    }
  }

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