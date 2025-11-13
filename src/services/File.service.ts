// Import firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";

// Import dtos
import { AgencyUserInviteContractCopyPsuToUploadApiDto, AgencyUserInviteContractCopyPsuToViewApiDto, AgencyUserSubmissionCvPsuToUploadApiDto, PreSignedUrlToUploadFileResponseDto, PreSignedUrlToViewFileResponseDto } from "../dtos/File.dto";

// Import helpers
import { getActionByAgencyUserIds, getActionByUserId } from "../helpers/user.helper";

// Import models
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbCompanyJobDto } from "../db/aws-dynamodb-models/CompanyJob.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";


// Import services
import { companyDetailServiceObj } from "./CompanyDetail.service";
import { agencyUserInviteServiceObj } from "./AgencyUserInvite.service";
import { corporateUserServiceObj } from "./CorporateUser.service";
import UlidService from "./Ulid.service";
import { companyJobServiceObj } from "./CompanyJob.service";
import { agencyUserServiceObj } from "./AgencyUser.service";
import { agencyJobAssignmentServiceObj } from "./AgencyJobAssignment.service";


// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class FileService {
  private async validatePsuToUploadOrViewAgencyUserInviteContractCopy(
    requestBodyObject:
      | AgencyUserInviteContractCopyPsuToUploadApiDto
      | AgencyUserInviteContractCopyPsuToViewApiDto
  ) {
    global.logger.info(
      `Validating agency user invite contract copy before uploading or viewing. [File Service]`,
      {
        requestBodyObject,
        methodName:
          this.validatePsuToUploadOrViewAgencyUserInviteContractCopy.name,
      }
    );

    const requestBodyCompanyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(
        requestBodyObject.companyId
      );
    if (!requestBodyCompanyDetails.count) {
      throw new BaseError(
        `Company Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const requestBodyCompanyData: DbCompanyDetailDto =
      requestBodyCompanyDetails[0];

    const requestBodyAgencyInviteDetails: DbAgencyUserInviteDto | undefined =
      await agencyUserInviteServiceObj.getAgencyUserInviteById(
        requestBodyObject.agencyInviteId
      );

    if (!requestBodyAgencyInviteDetails) {
      throw new BaseError(
        `Agency User Invite not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    if (
      requestBodyAgencyInviteDetails.companyId !== requestBodyCompanyData.id
    ) {
      global.logger.error(
        `Agency User Invite does not belong to the company. [File Service]`,
        {
          requestBodyObject,
          requestBodyAgencyInviteDetails,
          requestBodyCompanyData,
          methodName:
            this.validatePsuToUploadOrViewAgencyUserInviteContractCopy.name,
        }
      );
      throw new BaseError(
        `You are not allowed to access this resource.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    const { actionByCorporateUserId } = getActionByUserId();

    if (!actionByCorporateUserId) {
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }

    const actionByCorporateUserDetails: DbCorporateUserDto =
      await corporateUserServiceObj.getCorpUserByIdWithParsing(
        actionByCorporateUserId
      );

    if (actionByCorporateUserDetails.companyId !== requestBodyCompanyData.id) {
      global.logger.error(
        `User does not belong to the company. [File Service]`,
        {
          requestBodyObject,
          requestBodyCompanyData,
          actionByCorporateUserDetails,
          methodName:
            this.validatePsuToUploadOrViewAgencyUserInviteContractCopy.name,
        }
      );

      throw new BaseError(
        `You are not allowed to access this resource.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    if (
      actionByCorporateUserDetails.id !==
      requestBodyAgencyInviteDetails.invitedByCorporateUserId
    ) {
      global.logger.error(
        `You didn't invite this agency user. [File Service]`,
        {
          requestBodyObject,
          requestBodyAgencyInviteDetails,
          actionByCorporateUserDetails,
          methodName:
            this.validatePsuToUploadOrViewAgencyUserInviteContractCopy.name,
        }
      );
      throw new BaseError(
        `You are not allowed to access this resource.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }
  }

  async generatePsuToUploadAgencyUserInviteContractCopy(
    requestBodyObject: AgencyUserInviteContractCopyPsuToUploadApiDto
  ): Promise<PreSignedUrlToUploadFileResponseDto> {
    global.logger.info(
      `Generating pre-signed url to upload agency user invite contract copy. [File Service]`,
      {
        methodName: this.generatePsuToUploadAgencyUserInviteContractCopy.name,
      }
    );

    await this.validatePsuToUploadOrViewAgencyUserInviteContractCopy(
      requestBodyObject
    );

    const { companyId, agencyInviteId, fileMimeType, fileName } =
      requestBodyObject;

    const fileUploadPath: string =
      APP_CONSTANTS.AWS_S3_DIR_PATHS.AGENCY_INVITE_CONTRACT_COPY.strtr({
        "{companyId}": companyId,
        "{agencyInviteId}": agencyInviteId,
      });

    const fileExtension: string = fileName.split(".").pop() as string;

    const cloudFileName: string = `${UlidService.getUlidId()}.${fileExtension}`;

    const bucketName: string | undefined =
      process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE;
    if (!bucketName) {
      global.logger.error(`AWS S3 bucket name not found. [File Service]`, {
        bucketName,
        methodName: this.generatePsuToUploadAgencyUserInviteContractCopy.name,
      });

      throw new BaseError(
        `AWS S3 bucket name not found.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const fileSignedUrl: string =
      await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        bucketName,
        `${fileUploadPath}/${cloudFileName}`,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: fileMimeType,
        }
      );

    return {
      userFileName: fileName,
      cloudFileName: cloudFileName,
      fileMimeType: fileMimeType,
      fileExtension: fileExtension,
      awsS3SignedUrl: fileSignedUrl,
    };
  }

  private async validatePsuToUploadAgencyUserSubmissionCv(
    requestBodyObject: AgencyUserSubmissionCvPsuToUploadApiDto,
    convertedAgencyCognitoUserId: string
  ) {
    const { companyId, jobId } = requestBodyObject;

    const reqBodyCompanyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(companyId);
    if (!reqBodyCompanyDetails.count) {
      throw new BaseError(
        `Company details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const reqBodyCompanyData: DbCompanyDetailDto = reqBodyCompanyDetails[0];

    const reqBodyJobDetails: QueryResponse<DbCompanyJobDto> =
      await companyJobServiceObj.getJobById(jobId);
    if (!reqBodyJobDetails.count) {
      throw new BaseError(
        `Job details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const reqBodyJobData: DbCompanyJobDto = reqBodyJobDetails[0];

    if (reqBodyCompanyData.id !== reqBodyJobData.companyId) {
      throw new BaseError(
        `Job does not belong to the company.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    const agencyUserDetails: DbAgencyUserDto | undefined =
      await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId
      );
    if (!agencyUserDetails) {
      throw new BaseError(
        `We couldn’t verify your details. Please log out and sign in again to continue.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Check whether this `companyJob` is assigned to this `agency` or not by using `companyId` `agencyRegisteredEmail`,`jobId`
    const reqBodyAgencyJobAssignmentDetails: QuerySnapshot<DocumentData, DocumentData> =
      await agencyJobAssignmentServiceObj.getAgencyJobAssignmentByCompIdJobIdAndEmail(
        reqBodyCompanyData.id,
        jobId,
        agencyUserDetails.email
      );
    if (reqBodyAgencyJobAssignmentDetails.empty) {
      throw new BaseError(
        `You are not allowed to perform action on this resource.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }
  }

  async generatePsuToUploadAgencyUserSubmissionCv(
    requestBodyObject: AgencyUserSubmissionCvPsuToUploadApiDto
  ): Promise<PreSignedUrlToUploadFileResponseDto> {
    global.logger.info(
      `Generating pre-signed url to upload agency user submission cv. [File Service]`,
      {
        methodName: this.generatePsuToUploadAgencyUserSubmissionCv.name,
      }
    );

    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();

    await this.validatePsuToUploadAgencyUserSubmissionCv(
      requestBodyObject,
      convertedAgencyCognitoUserId
    );

    const { companyId, jobId, fileMimeType, fileName } = requestBodyObject;

    const fileUploadPath: string =
      APP_CONSTANTS.AWS_S3_DIR_PATHS.AGENCY_SUBMIT_USER_CV.strtr({
        "{agencyUserId}": convertedAgencyCognitoUserId,
        "{companyId}": companyId,
        "{jobId}": jobId,
      });

    const fileExtension: string = fileName.split(".").pop() as string;

    const cloudFileName: string = `${UlidService.getUlidId()}.${fileExtension}`;

    const bucketName: string | undefined =
      process.env.APP_AWS_S3_BUCKET_WORKO_APP;
    if (!bucketName) {
      global.logger.error(`AWS S3 bucket name not found. [File Service]`, {
        bucketName,
        methodName: this.generatePsuToUploadAgencyUserInviteContractCopy.name,
      });

      throw new BaseError(
        `AWS S3 bucket name not found.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const fileSignedUrl: string =
      await awsS3ClientLibrary.getSignedUrlForUploadingObject(
        bucketName,
        `${fileUploadPath}/${cloudFileName}`,
        APP_CONSTANTS.AWS_S3_SIGNED_URL_TO_UPLOAD_FILE_EXPIRY_IN_SECONDS,
        {
          ContentType: fileMimeType,
        }
      );

    return {
      userFileName: fileName,
      cloudFileName: cloudFileName,
      fileMimeType: fileMimeType,
      fileExtension: fileExtension,
      awsS3SignedUrl: fileSignedUrl,
    };
  }

  async generatePsuToViewAgencyUserInviteContractCopy(
    requestBodyObject: AgencyUserInviteContractCopyPsuToViewApiDto
  ): Promise<PreSignedUrlToViewFileResponseDto> {
    global.logger.info(
      `Generating pre-signed url to view agency user invite contract copy. [File Service]`,
      {
        methodName: this.generatePsuToViewAgencyUserInviteContractCopy.name,
      }
    );

    await this.validatePsuToUploadOrViewAgencyUserInviteContractCopy(
      requestBodyObject
    );

    const { companyId, agencyInviteId, contractCopyAwsS3FileName } =
      requestBodyObject;

    const filePath: string =
      APP_CONSTANTS.AWS_S3_DIR_PATHS.AGENCY_INVITE_CONTRACT_COPY.strtr({
        "{companyId}": companyId,
        "{agencyInviteId}": agencyInviteId,
      });

    const bucketName: string | undefined =
      process.env.APP_AWS_S3_BUCKET_WORKO_CORPORATE;
    if (!bucketName) {
      global.logger.error(`AWS S3 bucket name not found. [File Service]`, {
        bucketName,
        methodName: this.generatePsuToUploadAgencyUserInviteContractCopy.name,
      });

      throw new BaseError(
        `AWS S3 bucket name not found.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const objectUrl: string = await awsS3ClientLibrary.generateObjectUrl(
      bucketName,
      `${filePath}/${contractCopyAwsS3FileName}`
    );

    return {
      objectUrl: objectUrl,
    };
  }
}

const fileServiceObj = new FileService();
export { fileServiceObj, FileService };