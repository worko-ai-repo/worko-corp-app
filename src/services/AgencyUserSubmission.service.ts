
// Import aws lambda related types
import { APIGatewayProxyResult } from "aws-lambda";

// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import google cloud firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import dtos
import { AgencyUserSubmissionCandidateParseCvApiDto, AgencyUserSubmissionCandidateParseCvResponseDto, AgencyUserSubmissionCreateApiDto } from "../dtos/AgencyUserSubmission.dto";

// Import daos
import { agencyUserSubmissionDaoObj } from "../daos/AgencyUserSubmission.dao";
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";
import { candidateProfileDaoObj } from "../daos/CandidateProfile.dao";

// Import enums
import { CandidateProfileDbRefereeTypeEnum } from "../enums/CandidateProfile.enum";

// Import helpers
import { getActionByAgencyUserIds } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";
import { DbCompanyJobDto } from "../db/aws-dynamodb-models/CompanyJob.model";
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbCandidateProfileDto } from "../db/gcp-firestore-models/CandidateProfile.model";
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";

// Import services
import { agencyUserServiceObj } from "./AgencyUser.service";
import { companyDetailServiceObj } from "./CompanyDetail.service";
import { companyJobServiceObj } from "./CompanyJob.service";
import { agencyJobAssignmentServiceObj } from "./AgencyJobAssignment.service";
import InvokeLambdaService from "./InvokeLambda.service";
import UlidService from "./Ulid.service";
import UserDetailService from "./UserDetail.service";


// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";
import { candidateProfileServiceObj } from "./CandidateProfile.service";

class AgencyUserSubmissionService {

  private async validateAgencyUserSubmissionCompanyJobPermissions(
    reqBodyCompanyId: string,
    reqBodyJobId: string
  ): Promise<{
    agencyUserDetails: DbAgencyUserDto;
    reqBodyCompanyData: DbCompanyDetailDto;
    reqBodyJobData: DbCompanyJobDto;
    jobAssignedToAgency: DbAgencyJobAssignmentDto;
  }> {
    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();
    const agencyUserDetails: DbAgencyUserDto | undefined =
      await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId
      );
    if (!agencyUserDetails) {
      global.logger.error(`Agency User Details not found.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        convertedAgencyCognitoUserId,
      });
      throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
    }

    const reqBodyCompanyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(reqBodyCompanyId);
    if (!reqBodyCompanyDetails.count) {
      throw new BaseError(
        `Company details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const reqBodyCompanyData: DbCompanyDetailDto = reqBodyCompanyDetails[0];

    const reqBodyJobDetails: QueryResponse<DbCompanyJobDto> =
      await companyJobServiceObj.getJobById(reqBodyJobId);
    if (!reqBodyJobDetails.count) {
      throw new BaseError(
        `Job details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const reqBodyJobData: DbCompanyJobDto = reqBodyJobDetails[0];

    if (reqBodyCompanyData.id !== reqBodyJobData.companyId) {
      global.logger.error(`Job does not belong to the company.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        reqBodyCompanyId,
        reqBodyJobId,
        reqBodyCompanyData,
        reqBodyJobData,
      });
      throw new BaseError(
        `You are not allowed to perform this action.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    /**
     * Check whether this "companyJob" is assigned to this "agency" or not by using "companyId" "agencyRegisteredEmail","jobId" in "AgencyJobAssignment" model
     */
    const jobAssignedToAgency: QuerySnapshot<DocumentData, DocumentData> =
      await agencyJobAssignmentServiceObj.getAgencyJobAssignmentByCompIdJobIdAndEmail(
        reqBodyCompanyId,
        reqBodyJobId,
        agencyUserDetails.email
      );
    if (jobAssignedToAgency.empty) {
      global.logger.error(`Job is not assigned to the agency.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        reqBodyCompanyId,
        reqBodyJobId,
        reqBodyCompanyData,
        reqBodyJobData,
      });
      throw new BaseError(
        `You are not allowed to perform this action.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    return {
      agencyUserDetails,
      reqBodyCompanyData,
      reqBodyJobData,
      jobAssignedToAgency: (jobAssignedToAgency.docs[0].data()) as DbAgencyJobAssignmentDto,
    };
  }

  async parseAgencyUserSubmissionCandidateCv(
    validatedReqBody: AgencyUserSubmissionCandidateParseCvApiDto
  ) {
    global.logger.info(`Parse Agency User Submission Candidate CV [Service]`, {
      methodName: this.parseAgencyUserSubmissionCandidateCv.name,
    });

    const { companyId: reqBodyCompanyId, jobId: reqBodyJobId } =
      validatedReqBody;

    const validateAgencyUserCompanyJobDetails: {
      agencyUserDetails: DbAgencyUserDto;
      reqBodyCompanyData: DbCompanyDetailDto;
      reqBodyJobData: DbCompanyJobDto;
      jobAssignedToAgency: DbAgencyJobAssignmentDto;
    } = await this.validateAgencyUserSubmissionCompanyJobPermissions(
      reqBodyCompanyId,
      reqBodyJobId
    );

    const parsedCvDetails: APIGatewayProxyResult =
      await InvokeLambdaService.triggerParseAgencyUserSubmissionCandidateCv({
        companyId: reqBodyCompanyId,
        jobId: reqBodyJobId,
        agencyUserId: validateAgencyUserCompanyJobDetails.agencyUserDetails.id,
        candidateParsedCvAwsS3FileName:
          validatedReqBody.candidateParsedCvAwsS3FileName,
      });
    if (parsedCvDetails.statusCode !== HttpStatusCode.OK_200) {
      global.logger.error(`Failed to parse CV.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        parsedCvDetails,
      });
      throw new BaseError(
        "Failed to parse CV.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const parsedCvData: AgencyUserSubmissionCandidateParseCvResponseDto =
      JSON.parse(parsedCvDetails.body);

    if (!parsedCvData.email) {
      global.logger.error(`Candidate email not found in parsed CV..`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        parsedCvData,
      });
      throw new BaseError(
        "Failed to parse CV.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    const existingCandidateProfile: QuerySnapshot<
      DocumentData,
      DocumentData
    > = await candidateProfileServiceObj.getDuplicateCandidateProfile(
      reqBodyCompanyId,
      parsedCvData.email, // candidate email
      parsedCvData.phoneNumberDetails, // candidate phone number details
    );
    if (!existingCandidateProfile.empty) {
      global.logger.error(
        `Candidate is already submitted for the company job.`,
        {
          methodName: this.parseAgencyUserSubmissionCandidateCv.name,
          reqBodyCompanyId,
          reqBodyJobId,
          parsedCvData,
          duplicateCandidateProfile: existingCandidateProfile.docs[0].data(),
        }
      );
      throw new BaseError(
        `Duplicate profile.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    return parsedCvData;
  }

  async performCreateAgencyUserSubmissionActivities(
    validatedReqBody: AgencyUserSubmissionCreateApiDto
  ): Promise<DbAgencyUserSubmissionDto> {
    global.logger.info(
      `Perform Create Agency User Submission Activities [Service]`,
      {
        methodName: this.performCreateAgencyUserSubmissionActivities.name,
      }
    );

    const { companyId: reqBodyCompanyId, jobId: reqBodyJobId, agencyComments, ...candidateParsedCvData } =
      validatedReqBody;

    const {email: reqBodyParsedCvCandidateEmail} = candidateParsedCvData;

    const validatedAgencyUserCompanyJobDetails: {
      agencyUserDetails: DbAgencyUserDto;
      reqBodyCompanyData: DbCompanyDetailDto;
      reqBodyJobData: DbCompanyJobDto;
      jobAssignedToAgency: DbAgencyJobAssignmentDto;
    } = await this.validateAgencyUserSubmissionCompanyJobPermissions(
      reqBodyCompanyId,
      reqBodyJobId
    );

    const {
      agencyUserDetails,
      jobAssignedToAgency
    } = validatedAgencyUserCompanyJobDetails;

    const existingCandidateProfile: QuerySnapshot<
      DocumentData,
      DocumentData
    > = await candidateProfileServiceObj.getDuplicateCandidateProfile(
      reqBodyCompanyId,
      reqBodyParsedCvCandidateEmail,
      candidateParsedCvData.phoneNumberDetails
    );
    if (!existingCandidateProfile.empty) {
      global.logger.error(
        `Candidate is already submitted for the company.`,
        {
          methodName: this.parseAgencyUserSubmissionCandidateCv.name,
          reqBodyCompanyId,
          reqBodyJobId,
          duplicateCandidateProfile: existingCandidateProfile.docs[0].data(),
        }
      );
      throw new BaseError(
        `Duplicate profile.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    const currentDate: string = dateHelperObj.getISODate();

    /**
     * Prepare data to Store Candidate parsed details in "CandidateParsedCv" model
     */
    const candidateParsedCvCreateData: DbCandidateParsedCvDto = {
      ...candidateParsedCvData,
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
    }

    /**
     * Prepare data to Store Agency User Submission details in "AgencyUserSubmission" model
     */
    const agencyUserSubmissionCreateData: DbAgencyUserSubmissionDto = {
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      companyId: reqBodyCompanyId,
      jobId: reqBodyJobId,
      candidateEmail: reqBodyParsedCvCandidateEmail,
      candidateParsedCvId: candidateParsedCvCreateData.id,
      agencyUserId: agencyUserDetails.id,
      agencyRegisteredEmail: agencyUserDetails.email,
      agencyJobAssignmentId: jobAssignedToAgency.id,
      agencyComments,
      agencyJobAssignedByCorporateUserId: jobAssignedToAgency.assignedByCorporateUserId,
      agencyJobAssignedByUserId: jobAssignedToAgency.assignedByUserId,
    };

    /**
     * Prepare data to Store Agency User Submission details in "CandidateProfile" model
     */
    const candidateProfileCreateData: DbCandidateProfileDto = {
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      companyId: reqBodyCompanyId,
      jobId: reqBodyJobId,
      candidateEmail: reqBodyParsedCvCandidateEmail,
      refereeType: CandidateProfileDbRefereeTypeEnum.AGENCY,
      candidateParsedCvId: candidateParsedCvCreateData.id,
      agencyUserSubmissionId: agencyUserSubmissionCreateData.id,
      phoneNumberDetails: candidateParsedCvCreateData.phoneNumberDetails
    };

    const candidateRegisteredDetails: QueryResponse<DbUserDetailDto> = await UserDetailService.get(reqBodyParsedCvCandidateEmail);
    if(candidateRegisteredDetails.count) {
      const userDetailData: DbUserDetailDto = candidateRegisteredDetails[0];
      agencyUserSubmissionCreateData.userDetailId = userDetailData.id;
      candidateProfileCreateData.userDetailId = userDetailData.id;
    }

    const createAgencyUserSubmissionResult: [
      DbCandidateParsedCvDto | undefined,
      DbAgencyUserSubmissionDto | undefined,
      DbCandidateProfileDto | undefined
    ] = await Promise.all([
      candidateParsedCvDaoObj.createCandidateParsedCv(
        candidateParsedCvCreateData
      ),
      this.createAgencyUserSubmission(agencyUserSubmissionCreateData),
      candidateProfileDaoObj.createCandidateProfile(candidateProfileCreateData),
    ]);

    // If any of the result is failed to create then throw error
    if(
      !createAgencyUserSubmissionResult[0] ||
      !createAgencyUserSubmissionResult[1] ||
      !createAgencyUserSubmissionResult[2]
    ) {
      global.logger.error(`Failed to create Agency User Submission.`, {
        methodName: this.parseAgencyUserSubmissionCandidateCv.name,
        createAgencyUserSubmissionResult,
      });

      /**
       * @todo: Need to implement "rollback" functionality if any of the result is failed to create
       */

      throw new BaseError(
        `Failed to Submit Candidate Profile.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    return createAgencyUserSubmissionResult[1];
  }

  async createAgencyUserSubmission(
    createData: DbAgencyUserSubmissionDto
  ): Promise<DbAgencyUserSubmissionDto | undefined> {
    global.logger.info(`Create Agency User Submission [Service]`, {
      methodName: this.createAgencyUserSubmission.name,
    });

    return agencyUserSubmissionDaoObj.createAgencyUserSubmission(createData);
  }
}

const agencyUserSubmissionServiceObj = new AgencyUserSubmissionService();
export { agencyUserSubmissionServiceObj, AgencyUserSubmissionService };