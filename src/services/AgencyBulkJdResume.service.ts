// import google cloud firestore
import { FieldValue } from "@google-cloud/firestore";

// import daos
import { agencyBulkJdResumeDaoObj } from "../daos/AgencyBulkJdResume.dao";

// import enums
import { AgencyBulkJdResumeProcessingStatusEnum } from "../enums/AgencyBulkJdResume.enum";

// import dtos
import {
  AgencyBulkJdResumeCreateApiDto,
  AgencyBulkJdResumeCreateResponseDto,
  AgencyBulkJdResumeDbCvExtractedParsedDto,
  AgencyBulkJdResumeFilterOptions,
} from "../dtos/AgencyBulkJdResume.dto";
import { AgencyBulkCvsPreSignedUrlToUploadFileDto, PreSignedUrlToUploadFileResponseDto } from "../dtos/File.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// import enums
import { AgencyBulkJdProcessingStatusEnum } from "../enums/AgencyBulkJd.enum";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// import models
import { DbAgencyBulkJdResumeDto } from "../db/gcp-firestore-models/AgencyBulkJdResume.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbAgencyBulkJdDto } from "../db/gcp-firestore-models/AgencyBulkJd.model";
import { DbAgencyCvWalletDto } from "../db/gcp-firestore-models/AgencyCvWallet.model";
import { DbAgencyCvDebitTransactionDto } from "../db/gcp-firestore-models/AgencyCvDebitTransaction.model";

// import services
import { agencyUserServiceObj } from "./AgencyUser.service";
import { agencyBulkJdServiceObj } from "./AgencyBulkJd.service";
import { fileServiceObj } from "./File.service";
import { agencyCvDebitTransactionServiceObj } from "./AgencyCvDebitTransaction.service";
import { agencyCvWalletServiceObj } from "./AgencyCvWallet.service";

// import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * AgencyBulkJdResumeService
 *
 * Service for handling Agency Bulk JD Resume related operations
 */
class AgencyBulkJdResumeService {
  async createAgencyBulkJdResumes(
    agencyBulkJdId: string,
    validatedRequestBody: AgencyBulkJdResumeCreateApiDto,
  ): Promise<AgencyBulkJdResumeCreateResponseDto> {
    const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.validateAgencyUserAuthAccess();
    if(!agencyUserDetails) {
      global.logger.error(`Agency User not found. [CONTROLLER]`, {
        methodName: this.createAgencyBulkJdResumes.name,
        validatedRequestBody,
        agencyUserDetails,
      });
      throw new BaseError(
        "Unauthorized.",
        HttpStatusCode.UNAUTHORIZED_401
      );
    }

    const createdByAgencyUserId: string = agencyUserDetails.id;

    // Verify the agency bulk JD exists
    const agencyBulkJd: DbAgencyBulkJdDto | undefined = await agencyBulkJdServiceObj.getAgencyBulkJdById(
      agencyBulkJdId
    );
    if (!agencyBulkJd) {
      global.logger.error(
        "Bulk job description not found. [SERVICE]",
        {
          methodName: this.createAgencyBulkJdResumes.name,
          createdByAgencyUserId,
          agencyBulkJd,
          agencyUserDetails
        }
      )
      throw new BaseError(
        "Bulk job description not found.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    // Verify the agency user owns this bulk JD
    if (agencyBulkJd.createdByAgencyUserId !== createdByAgencyUserId) {
      global.logger.error(
        "You are not authorized to upload resumes for this job description. [SERVICE]",
        {
          methodName: this.createAgencyBulkJdResumes.name,
          createdByAgencyUserId,
          agencyBulkJd,
          agencyUserDetails
        }
      )
      throw new BaseError(
        "You are not authorized to upload resumes for this job description.",
        HttpStatusCode.FORBIDDEN_403
      );
    }

    // Prepare Argument for Generating Agency Bulk Cvs Pre-signed urls
    const psuToUploadBulkCvsParams: AgencyBulkCvsPreSignedUrlToUploadFileDto = {
      agencyBulkJdId,
      bulkCvs: validatedRequestBody.bulkCvs,
    };

    // Generate Pre-Signed urls
    const psuToUploadBulkCvsDetails: PreSignedUrlToUploadFileResponseDto[] =
      await fileServiceObj.generatePsuToUploadAgencyBulkCvs(
        createdByAgencyUserId,
        psuToUploadBulkCvsParams
      );

    const currentDate: string = dateHelperObj.getISODate();
    const createBulkData: DbAgencyBulkJdResumeDto[] =
      psuToUploadBulkCvsDetails.map((eachPsu: PreSignedUrlToUploadFileResponseDto) => {
        const agencyBulkJdResumeDocId: string = eachPsu.cloudFileName.split(".")[0];
        const createData: DbAgencyBulkJdResumeDto = {
          id: agencyBulkJdResumeDocId,
          agencyBulkJdId,
          companyId: agencyBulkJd.companyId,
          createdByAgencyUserId,
          userFileName: eachPsu.userFileName,
          cloudFileName: eachPsu.cloudFileName,
          processingStatus: AgencyBulkJdResumeProcessingStatusEnum.PENDING,
          createdAt: currentDate,
          updatedAt: currentDate,
          agencyRegisteredEmail: agencyUserDetails.email
        }
        return createData;
      });

    const isCreatedInDb: boolean = await this.createBulkAgencyBulkJdResume(createBulkData);

    return {
      agencyBulkJdId,
      bulkCvs: psuToUploadBulkCvsDetails,
      bulkCvsStorageFailed: !isCreatedInDb
    }
  }

  async createBulkAgencyBulkJdResume(
    validatedRequestBody: DbAgencyBulkJdResumeDto[]
  ): Promise<boolean> {
    global.logger.info(`Create Multiple Agency Job Assignment [Service]`, {
      methodName: this.createBulkAgencyBulkJdResume.name,
    });

    return agencyBulkJdResumeDaoObj.createBulkAgencyBulkJdResume(
      validatedRequestBody
    );
  }

  async getAllAgencyBulkJdResumesByFilterOptions(
    filterOptions: AgencyBulkJdResumeFilterOptions,
    agencyUserDetails: DbAgencyUserDto
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyBulkJdResumeDto[]>> {
    // logger
    global.logger.info("Get all Agency Bulk JD Resumes [Service]", {
      methodName: this.getAllAgencyBulkJdResumesByFilterOptions.name,
    });

    // Get all the resume details with pagination
    return agencyBulkJdResumeDaoObj.getAllAgencyBulkJdResumesByFilterOptions(
      filterOptions,
      agencyUserDetails
    );
  }

  async getAgencyBulkJdResumeById(
    resumeId: string
  ): Promise<DbAgencyBulkJdResumeDto | undefined> {
    // logger
    global.logger.info("Get Agency Bulk JD Resume by id [Service]", {
      methodName: this.getAgencyBulkJdResumeById.name,
      resumeId,
    });

    // get agency bulk jd resume and Throw error if the data not found
    return agencyBulkJdResumeDaoObj.getAgencyBulkJdResumeById(resumeId);
  }

  private async validateUpdateAgencyCvDebit(
    agencyBulkJdDetails: DbAgencyBulkJdDto,
    agencyBulkJdResumeDetails: DbAgencyBulkJdResumeDto,
    isSuccess: boolean
  ): Promise<boolean> {
    const updateAgencyBulkJdDto: Partial<DbAgencyBulkJdDto> = {
      totalResumesProcessed: FieldValue.increment(1),
    }
    if(isSuccess) {
      updateAgencyBulkJdDto.totalResumesSucceeded = FieldValue.increment(1);
    } else {
      updateAgencyBulkJdDto.totalResumesFailed = FieldValue.increment(1);
    }
    const updateAgencyBulkJd: DbAgencyBulkJdDto | undefined = await agencyBulkJdServiceObj.updateAgencyBulkJdById(
      agencyBulkJdDetails.id,
      updateAgencyBulkJdDto
    );

    if(!updateAgencyBulkJd) {
      global.logger.error(
        `Failed to update the agency bulk jd details. [SERVICE]`,
        {
          methodName:
            this
              .validateUpdateAgencyCvDebit
              .name,
          agencyBulkJdResumeDetails
        }
      )
      return false;
    }

    if(updateAgencyBulkJd.totalResumesProcessed === updateAgencyBulkJd.resumesCount) {
      const updateAgencyBulkJdStatus = agencyBulkJdServiceObj.updateAgencyBulkJdById(
        updateAgencyBulkJd.id,
        {
          processingStatus: AgencyBulkJdProcessingStatusEnum.COMPLETED
        }
      );

      const createAgencyCvDebitTransaction = agencyCvDebitTransactionServiceObj.createAgencyCvDebitTransaction(
        {
          agencyUserId: updateAgencyBulkJd.createdByAgencyUserId,
          agencyBulkJdId: updateAgencyBulkJd.id,
          cvUsed: updateAgencyBulkJd.totalResumesSucceeded as number,
          agencyRegisteredEmail: agencyBulkJdResumeDetails.agencyRegisteredEmail
        }
      );

      const completionPromises: (
        Promise<DbAgencyBulkJdDto | undefined> |
        Promise<DbAgencyCvDebitTransactionDto | undefined> |
        Promise<DbAgencyCvWalletDto | undefined>
      )[] = [updateAgencyBulkJdStatus, createAgencyCvDebitTransaction];

      if(isSuccess) {
        const existingAgencyCvWallet: DbAgencyCvWalletDto | undefined = await agencyCvWalletServiceObj.getAgencyCvWalletById(updateAgencyBulkJd.createdByAgencyUserId);
        if(!existingAgencyCvWallet) {
          global.logger.error(`Agency Cv Wallet not found. [SERVICE]`, {
            methodName: this.validateUpdateAgencyCvDebit.name,
            updateAgencyBulkJd,
          });
          return false;
        }
        const updateAgencyCvWallet = agencyCvWalletServiceObj.updateAgencyCvWalletById(
          updateAgencyBulkJd.createdByAgencyUserId,
          {
            totalAvailableCvCount: existingAgencyCvWallet.totalAvailableCvCount - (updateAgencyBulkJd.totalResumesSucceeded as number),
            totalUsedCvCount: existingAgencyCvWallet.totalUsedCvCount + (updateAgencyBulkJd.totalResumesSucceeded as number),
            lastCvDeductionDate: dateHelperObj.getISODate(),
          }
        )

        completionPromises.push(updateAgencyCvWallet);
      }

      const result = await Promise.all(
        completionPromises
      );
      if(!result) {
        global.logger.error(
          `Failed to update the agency bulk jd details. [SERVICE]`,
          {
            methodName:
              this
                .validateUpdateAgencyCvDebit
                .name,
            result
          }
        )
        return false;
      }
      return true;
    }

    return true;
  }

  async validateAgencyBulkJdResumePostMatchingScore(agencyBulkJdResumeId: string): Promise<boolean> {
    const agencyBulkJdResumeDetails: DbAgencyBulkJdResumeDto | undefined = await this.getAgencyBulkJdResumeById(agencyBulkJdResumeId);
    if (!agencyBulkJdResumeDetails) {
      global.logger.error(
        "Failed to find the agency bulk jd resume details. [SERVICE]",
        {
          methodName: this.validateAgencyBulkJdResumePostMatchingScore.name,
          agencyBulkJdResumeId,
        }
      );

      return false;
    }

    const agencyBulkJdDetails: DbAgencyBulkJdDto | undefined = await agencyBulkJdServiceObj.getAgencyBulkJdById(
      agencyBulkJdResumeDetails.agencyBulkJdId
    );
    if (!agencyBulkJdDetails) {
      global.logger.info(
        `Agency Bulk JD Details Not found. [SERVICE]`,
        {
          filePath: __filename,
          methodName:
            this
              .validateAgencyBulkJdResumePostMatchingScore
              .name,
          agencyBulkJdResumeId,
          agencyBulkJdResumeDetails,
          agencyBulkJdDetails,
        }
      );

      // Return false if not found
      return false;
    }

    // Get CV Extracted Parsed details
    const cvExtractedParsed: AgencyBulkJdResumeDbCvExtractedParsedDto | undefined =
      agencyBulkJdResumeDetails.cvExtractedParsed;
    if(!cvExtractedParsed) {
      global.logger.error(
        `CV Extracted Parsed Not found. [SERVICE]`,
        {
          methodName:
            this
              .validateAgencyBulkJdResumePostMatchingScore
              .name,
          agencyBulkJdResumeId,
          agencyBulkJdResumeDetails
        }
      )

      await this.validateUpdateAgencyCvDebit(agencyBulkJdDetails, agencyBulkJdResumeDetails, false);

      return false;
    }

    if(!cvExtractedParsed.candidateEmail) {
      global.logger.info(
        `Candidate Email Not found. [SERVICE]`,
        {
          methodName:
            this
              .validateAgencyBulkJdResumePostMatchingScore
              .name,
          agencyBulkJdResumeId,
          agencyBulkJdResumeDetails
        }
      )

      await this.validateUpdateAgencyCvDebit(agencyBulkJdDetails, agencyBulkJdResumeDetails, false);

      return false;
    }

    if(!agencyBulkJdResumeDetails.matchingScore) {
      global.logger.info(
        `Matching Score Not found. [SERVICE]`,
        {
          methodName:
            this
              .validateAgencyBulkJdResumePostMatchingScore
              .name,
          agencyBulkJdResumeId,
          agencyBulkJdResumeDetails
        }
      )

      await this.validateUpdateAgencyCvDebit(agencyBulkJdDetails, agencyBulkJdResumeDetails, false);

      return false;
    }

    await this.validateUpdateAgencyCvDebit(agencyBulkJdDetails, agencyBulkJdResumeDetails, true);

    return true;
  }
}

// Create an instance of the AgencyBulkJdResumeService class and export it
const agencyBulkJdResumeServiceObj = new AgencyBulkJdResumeService();
export { agencyBulkJdResumeServiceObj, AgencyBulkJdResumeService };
