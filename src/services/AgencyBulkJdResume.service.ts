
// import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// import configs
import APP_CONSTANTS from "../configs/constants.config";

// import daos
import { agencyBulkJdResumeDaoObj } from "../daos/AgencyBulkJdResume.dao";

// import enums
import { AgencyBulkJdResumeProcessingStatusEnum } from "../enums/AgencyBulkJdResume.enum";

// import dtos
import {
  AgencyBulkJdResumeCreateApiDto,
  AgencyBulkJdResumeCreateResponseDto,
  AgencyBulkJdResumeFilterOptions,
} from "../dtos/AgencyBulkJdResume.dto";
import { AgencyBulkCvsPreSignedUrlToUploadFileDto, PreSignedUrlToUploadFileResponseDto } from "../dtos/File.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// import models
import { DbAgencyBulkJdResumeDto } from "../db/gcp-firestore-models/AgencyBulkJdResume.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbAgencyBulkJdDto } from "../db/gcp-firestore-models/AgencyBulkJd.model";

// import services
import { agencyUserServiceObj } from "./AgencyUser.service";
import { agencyBulkJdServiceObj } from "./AgencyBulkJd.service";
import { fileServiceObj } from "./File.service";

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

    // Update resume count in corporate bulk jd model
    const updatedBulkJd: DbAgencyBulkJdDto | undefined = await agencyBulkJdServiceObj.updateAgencyBulkJdById(
      agencyBulkJdId,
      {
        resumesCount:
          (agencyBulkJd.resumesCount ?? 0) +
          validatedRequestBody.bulkCvs.length,
      }
    );
    if (!updatedBulkJd) {
      global.logger.error(
        "Failed to update the resumes count in the bulk job description. [SERVICE]",
        {
          methodName: this.createAgencyBulkJdResumes.name,
          createdByAgencyUserId,
          agencyBulkJd,
          agencyUserDetails
        }
      )
      throw new BaseError(
        "Failed to update the resumes count in the bulk job description.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
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

  /**
   * @note
   *  1. This code will be used when we want to send email to candidates for agency bulk cv check,
   *  as of now we are not sending email to candidates
   */
  /*
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

    // Get CV Extracted Parsed details
    const cvExtractedParsed: AgencyBulkJdResumeDbCvExtractedParsedDto | undefined =
      agencyBulkJdResumeDetails.cvExtractedParsed;
    if(!cvExtractedParsed) {
      global.logger.error(
        `CV Extracted Parsed Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
        {
          methodName:
            this
              .validateAgencyBulkJdResumePostMatchingScore
              .name,
          agencyBulkJdResumeId,
          agencyBulkJdResumeDetails
        }
      )
      return false;
    }

    if(!cvExtractedParsed.candidateEmail) {
      global.logger.info(
        `Candidate Email Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
        {
          methodName:
            this
              .validateAgencyBulkJdResumePostMatchingScore
              .name,
          agencyBulkJdResumeId,
          agencyBulkJdResumeDetails
        }
      )

      return false;
    }

    // Get Company Details By company Id
    const companyDetailResponse: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(
        agencyBulkJdResumeDetails.companyId
      );
    if (!companyDetailResponse.count) {
      global.logger.info(
        `Company Details Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
        {
          filePath: __filename,
          methodName:
            this
              .validateAgencyBulkJdResumePostMatchingScore
              .name,
          agencyBulkJdResumeId,
          agencyBulkJdResumeDetails
        }
      );

      // Return false if not found
      return false;
    }

    // Get Compny Details
    const companyDetails: DbCompanyDetailDto = companyDetailResponse[0];

    const agencyBulkJdDetails: DbAgencyBulkJdDto | undefined = await agencyBulkJdServiceObj.getAgencyBulkJdById(
      agencyBulkJdResumeDetails.agencyBulkJdId
    );
    if (!agencyBulkJdDetails) {
      global.logger.info(
        `Agency Bulk JD Details Not found, So Email and Whatsapp notification not sent. [SERVICE]`,
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

    // Construct the email address object
    const toAddress: EmailSourceDestinationAddress = {
      email: cvExtractedParsed.candidateEmail,
      fullName: cvExtractedParsed.candidateName,
    };

    // Initialize email promise
    let emailPromise: Promise<{
      awsMessageId: string | null;
      systemLogId: string | null;
    }>;

    // Check if the matching score is greater than given threshold
    if (
      agencyBulkJdResumeDetails.matchingScore &&
      agencyBulkJdResumeDetails.matchingScore >=
      APP_CONSTANTS.MATCHING_SCORES
        .AGENCY_BULK_JD_RESUME_MINIMUM_MATCHING_SCORE
    ) {
      // Construct the email placeholders object
      const emailPlaceholders: EmailTemplatePlaceholderCAND_AGENCY_BULK_JD_RESUME_HIGH_MATCHING_SCORE =
        {
          candidateName: cvExtractedParsed.candidateName.toTitleCase(),
          companyName: companyDetails.name.toTitleCase(),
          jobTitle: agencyBulkJdDetails.jobTitle.toTitleCase(),
          matchingScore: agencyBulkJdResumeDetails.matchingScore,
          signUpUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_SIGNUP_URL,
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      // Send email to the candidate
      emailPromise = emailLibrary.sendEmail(
        EmailTemplateEnum.CAND_AGENCY_BULK_JD_RESUME_HIGH_MATCHING_SCORE,
        toAddress,
        emailPlaceholders
      );
    } else {
      // Construct the email placeholders object
      const emailPlaceholders: EmailTemplatePlaceholderCAND_AGENCY_BULK_JD_RESUME_LOW_MATCHING_SCORE =
        {
          candidateName: cvExtractedParsed.candidateName.toTitleCase(),
          companyName: companyDetails.name.toTitleCase(),
          jobTitle: agencyBulkJdDetails.jobTitle.toTitleCase(),
          signUpUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_SIGNUP_URL,
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      // Send email to the candidate
      emailPromise = emailLibrary.sendEmail(
        EmailTemplateEnum.CAND_AGENCY_BULK_JD_RESUME_LOW_MATCHING_SCORE,
        toAddress,
        emailPlaceholders
      );
    }

    await Promise.all([
      emailPromise, 
    ]);

    return true;
  }
  */
}

// Create an instance of the AgencyBulkJdResumeService class and export it
const agencyBulkJdResumeServiceObj = new AgencyBulkJdResumeService();
export { agencyBulkJdResumeServiceObj, AgencyBulkJdResumeService };
