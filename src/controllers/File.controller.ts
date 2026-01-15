// Import express packages
import { Request, Response, NextFunction } from "express";

// Import dtos
import { AdminCandBulkCvUploadPsuToViewApiDto, AgencyBulkCvsPsuToViewApiDto, AgencyUserInviteContractCopyPsuToUploadApiDto, AgencyUserInviteContractCopyPsuToViewApiDto, AgencyUserSubmissionCvPsuToUploadApiDto, AgencyUserSubmissionCvPsuToViewApiDto, CorpCandBulkCvUploadPsuToViewApiDto, PreSignedUrlToUploadFileResponseDto, PreSignedUrlToViewFileResponseDto } from "../dtos/File.dto";

// Import enums
import { FileResourceKeyEnum } from "../enums/File.enum";

// Import schemas
import { adminCandBulkCvUploadPsuToViewApiDtoValidation, agencyBulkCvsPsuToViewApiDtoValidation, agencyUserInviteContractCopyPsuToUploadApiDtoValidation, agencyUserInviteContractCopyPsuToViewApiDtoValidation, agencyUserSubmissionCvPsuToUploadApiDtoValidation, agencyUserSubmissionCvPsuToViewApiDtoValidation, corpCandBulkCvUploadPsuToViewApiDtoValidation } from "../schemas/File.schema";

// Import services
import { fileServiceObj } from "../services/File.service";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError, RequestValidationError } from "../utils/errors.util";

class FileController {
  generatePsuToViewAgencyUserInviteContractCopy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let requestBodyObject: AgencyUserInviteContractCopyPsuToViewApiDto =
        req.body;

      const { error } =
        agencyUserInviteContractCopyPsuToViewApiDtoValidation.validate(
          requestBodyObject,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: PreSignedUrlToViewFileResponseDto =
        await fileServiceObj.generatePsuToViewAgencyUserInviteContractCopy(
          requestBodyObject
        );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url to view file. [File Controller]`,
        {
          error,
          methodName: this.generatePsuToViewAgencyUserInviteContractCopy.name,
        }
      );
      next(error);
    }
  };

  generatePsuToViewAgencyUserSubmissionCv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let requestBodyObject: AgencyUserSubmissionCvPsuToViewApiDto =
        req.body;

      const { error } =
        agencyUserSubmissionCvPsuToViewApiDtoValidation.validate(
          requestBodyObject,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: PreSignedUrlToViewFileResponseDto =
        await fileServiceObj.generatePsuToViewAgencyUserSubmissionCv(
          requestBodyObject
        );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url to view file. [File Controller]`,
        {
          error,
          methodName: this.generatePsuToViewAgencyUserSubmissionCv.name,
        }
      );
      next(error);
    }
  };

  generatePsuToViewAgencyBulkCvs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqBody: AgencyBulkCvsPsuToViewApiDto = req.body;
      const { error } = agencyBulkCvsPsuToViewApiDtoValidation.validate(
        reqBody,
        {
          abortEarly: false,
        }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: PreSignedUrlToViewFileResponseDto =
        await fileServiceObj.generatePsuToViewAgencyBulkCvs(reqBody);

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url to view file. [File Controller]`,
      )
      next(error);
    }
  };

  generatePsuToViewCorpCandBulkCvUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqBody: CorpCandBulkCvUploadPsuToViewApiDto = req.body;
      const { error } = corpCandBulkCvUploadPsuToViewApiDtoValidation.validate(
        reqBody,
        {
          abortEarly: false,
        }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: PreSignedUrlToViewFileResponseDto =
        await fileServiceObj.generatePsuToViewCorpCandBulkCvUpload(reqBody);

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url to view file. [File Controller]`,
      )
      next(error);
    }
  }

  generatePsuToViewAdminCandBulkCvUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const reqBody: AdminCandBulkCvUploadPsuToViewApiDto = req.body;
      const { error } = adminCandBulkCvUploadPsuToViewApiDtoValidation.validate(
        reqBody,
        {
          abortEarly: false,
        }
      );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: PreSignedUrlToViewFileResponseDto =
        await fileServiceObj.generatePsuToViewAdminCandBulkCvUpload(reqBody);

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url to view file. [File Controller]`,
      )
      next(error);
    }
  }

  generatePsuToUploadAgencyUserInviteContractCopy = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let requestBodyObject: AgencyUserInviteContractCopyPsuToUploadApiDto =
        req.body;

      const { error } =
        agencyUserInviteContractCopyPsuToUploadApiDtoValidation.validate(
          requestBodyObject,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: PreSignedUrlToUploadFileResponseDto =
        await fileServiceObj.generatePsuToUploadAgencyUserInviteContractCopy(
          requestBodyObject
        );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url for file upload. [File Controller]`,
        {
          error,
          methodName: this.generatePsuToUploadAgencyUserInviteContractCopy.name,
        }
      );
      next(error);
    }
  };

  generatePsuToUploadAgencyUserSubmissionCv = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let requestBodyObject: AgencyUserSubmissionCvPsuToUploadApiDto =
        req.body;

      const { error } =
        agencyUserSubmissionCvPsuToUploadApiDtoValidation.validate(
          requestBodyObject,
          {
            abortEarly: false,
          }
        );
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: PreSignedUrlToUploadFileResponseDto =
        await fileServiceObj.generatePsuToUploadAgencyUserSubmissionCv(
          requestBodyObject
        );

      return res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url for file upload. [File Controller]`,
        {
          error,
          methodName: this.generatePsuToUploadAgencyUserSubmissionCv.name,
        }
      );
      next(error);
    }
  };

  generatePreSignedUrlsToUpload = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resourceKey: string = req.params["resourceKey"];

      global.logger.info(
        `Generating pre-signed url to upload file. [File Controller]`,
        {
          resourceKey,
          methodName: this.generatePreSignedUrlsToUpload.name,
        }
      );

      switch (resourceKey) {
        case FileResourceKeyEnum.AGENCY_INVITE_CONTRACT_COPY:
          await this.generatePsuToUploadAgencyUserInviteContractCopy(
            req,
            res,
            next
          );
          break;

        case FileResourceKeyEnum.AGENCY_SUBMIT_USER_CV:
          await this.generatePsuToUploadAgencyUserSubmissionCv(req, res, next);
          break;

        default:
          throw new BaseError(
            "The provided 'resourceKey' is invalid. Please provide a valid 'resourceKey'.",
            HttpStatusCode.BAD_REQUEST_400
          );
      }
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url for file upload. [File Controller]`,
        {
          error,
          methodName: this.generatePreSignedUrlsToUpload.name,
        }
      );
      next(error);
    }
  };

  generatePreSignedUrlsToView = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const resourceKey: string = req.params["resourceKey"];

      global.logger.info(
        `Generating pre-signed url to view file. [File Controller]`,
        {
          resourceKey,
          methodName: this.generatePreSignedUrlsToView.name,
        }
      );

      switch (resourceKey) {
        case FileResourceKeyEnum.AGENCY_INVITE_CONTRACT_COPY:
          await this.generatePsuToViewAgencyUserInviteContractCopy(
            req,
            res,
            next
          );
          break;

        case FileResourceKeyEnum.AGENCY_SUBMIT_USER_CV:
          await this.generatePsuToViewAgencyUserSubmissionCv(req, res, next);
          break;

        case FileResourceKeyEnum.AGENCY_BULK_CVS: 
          await this.generatePsuToViewAgencyBulkCvs(req, res, next);
          break;

        case FileResourceKeyEnum.CORP_CAND_BULK_CV_UPLOAD:
          await this.generatePsuToViewCorpCandBulkCvUpload(req, res, next);
          break;

        case FileResourceKeyEnum.ADMIN_CAND_BULK_CV_UPLOAD:
          await this.generatePsuToViewAdminCandBulkCvUpload(req, res, next);
          break;

        default:
          throw new BaseError(
            "The provided 'resourceKey' is invalid. Please provide a valid 'resourceKey'.",
            HttpStatusCode.BAD_REQUEST_400
          );
      }
    } catch (error) {
      global.logger.error(
        `Error at catch block in while generating pre-signed url to view file. [File Controller]`,
        {
          error,
          methodName: this.generatePreSignedUrlsToView.name,
        }
      );
      next(error);
    }
  };
}

export default FileController;