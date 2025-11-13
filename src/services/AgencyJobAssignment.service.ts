
// Import dynamoose 
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import dtos
import { agencyJobAssignmentDaoObj } from "../daos/AgencyJobAssignment.dao";

// Import dtos
import { AgencyJobAssignmentBulkCreateApiDto, AgencyJobAssignmentListingFilterOptions } from "../dtos/AgencyJobAssignment.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import enums
import { AgencyJobAssignmentDbStatusEnum } from "../enums/AgencyJobAssignment.enum";
import { AgencyUserInviteDbStatusEnum } from "../enums/AgencyUserInvite.enum";

// Import helpers
import { getActionByAgencyUserIds, getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";
import { injectEntityDetailsGlobalIteratorHelper } from "../helpers/injectEntityDetailsGlobalIterator.helper";

// Import models
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

// Import services
import { corporateUserServiceObj } from "./CorporateUser.service";
import UlidService from "./Ulid.service";
import UserDetailService from "./UserDetail.service";
import { agencyUserInviteServiceObj } from "./AgencyUserInvite.service";
import { agencyUserServiceObj } from "./AgencyUser.service";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";

class AgencyJobAssignmentService {
  async performCreateBulkAgencyJobAssignmentActivities(
    validatedRequestBody: AgencyJobAssignmentBulkCreateApiDto
  ): Promise<boolean> {
    global.logger.info(
      `Perform Create Bulk Agency Job Assignment Activities [Service]`,
      {
        methodName: this.performCreateBulkAgencyJobAssignmentActivities.name,
      }
    );

    const reqBodyCompanyId: string = validatedRequestBody.companyId;
    const reqBodyAgencyEmail: string = validatedRequestBody.agencyEmail;
    const reqBodyAgencyInviteId: string = validatedRequestBody.agencyInviteId;

    const { actionByCorporateUserId, actionByUserId } = getActionByUserId();
    const cognitoUserGroupsUserGroups: string[] =
      global.requestLocalContext.cognitoUserGroups;

    const agencyUserInviteDetails: DbAgencyUserInviteDto | undefined =
      await agencyUserInviteServiceObj.getAgencyUserInviteById(
        reqBodyAgencyInviteId
      );
    if (!agencyUserInviteDetails) {
      throw new BaseError(
        `Agency User Invite Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    if (
      agencyUserInviteDetails.inviteStatus !==
      AgencyUserInviteDbStatusEnum.ACCEPTED
    ) {
      global.logger.error(`Agency User Invite is not accepted.`, {
        validatedRequestBody,
        agencyUserInviteDetails,
        methodName: this.performCreateBulkAgencyJobAssignmentActivities.name,
      });
      throw new BaseError(
        `Agency User Invite is not accepted, so you are not allowed to perform this action.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    if (actionByCorporateUserId) {
      const corporateUserDetails: QueryResponse<DbCorporateUserDto> =
        await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
      if (!corporateUserDetails.count) {
        throw new BaseError(
          `Corporate User Details not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }
      const corporateUserData = corporateUserDetails[0];
      if (corporateUserData.isDeleted) {
        global.logger.error(`Corporate user account is deleted.`, {
          methodName: this.performCreateBulkAgencyJobAssignmentActivities.name,
          corporateUserData,
        });
        throw new BaseError(
          `Your account is deleted, so you are not allowed to perform this action.`,
          HttpStatusCode.FORBIDDEN_403
        );
      }

      if (
        actionByCorporateUserId !==
        agencyUserInviteDetails.invitedByCorporateUserId
      ) {
        global.logger.error(
          `Corporate user did not invite the agency user, so you are not allowed to perform this action.`,
          {
            validatedRequestBody,
            corporateUserData,
            agencyUserInviteDetails,
            methodName:
              this.performCreateBulkAgencyJobAssignmentActivities.name,
          }
        );
        throw new BaseError(
          `You are not allowed to perform this action.`,
          HttpStatusCode.FORBIDDEN_403
        );
      }

      if (
        reqBodyCompanyId !== corporateUserData.companyId ||
        reqBodyCompanyId !== agencyUserInviteDetails.companyId
      ) {
        global.logger.error(
          `Corporate user is not associated with the company or the agency invite is not associated with the company.`,
          {
            validatedRequestBody,
            corporateUserData,
            agencyUserInviteDetails,
            methodName:
              this.performCreateBulkAgencyJobAssignmentActivities.name,
          }
        );
        throw new BaseError(
          `You are not allowed to perform this action.`,
          HttpStatusCode.FORBIDDEN_403
        );
      }
    } else if (
      actionByUserId &&
      cognitoUserGroupsUserGroups.includes(
        APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN
      )
    ) {
      const userDetails: QueryResponse<DbUserDetailDto> =
        await UserDetailService.getUserById(actionByUserId);
      if (!userDetails.count) {
        throw new BaseError(
          `Admin User Details not found.`,
          HttpStatusCode.NOT_FOUND_404
        );
      }
    } else {
      global.logger.error(
        `You are not worko-admin or corporate-admin/recruiter, so you are not allowed to perform this action.`,
        {
          actionByCorporateUserId,
          actionByUserId,
          validatedRequestBody,
          methodName: this.performCreateBulkAgencyJobAssignmentActivities.name,
        }
      );
      throw new BaseError(
        `You are not allowed to perform this action.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    /**
     * Check whether any one of the job is already assigned to this `agency` or not by using `companyId`, `jobId`, `agencyRegisteredEmail`
     */
    const existingAssignments: QuerySnapshot<DocumentData, DocumentData> =
      await this.getBulkAgencyAssignment(
        reqBodyCompanyId,
        reqBodyAgencyEmail,
        validatedRequestBody.jobsToAssign
      );

    if (!existingAssignments.empty) {
      throw new BaseError(
        `Few jobs are already assigned to this agency, so check and try again.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    const currentDate: string = dateHelperObj.getISODate();
    const createData: DbAgencyJobAssignmentDto[] =
      validatedRequestBody.jobsToAssign.map((eachJobId: string) => {
        return {
          companyId: reqBodyCompanyId,
          agencyRegisteredEmail: reqBodyAgencyEmail,
          jobId: eachJobId,
          id: UlidService.getUlidId(),
          assignedByCorporateUserId: actionByCorporateUserId,
          assignedByUserId: actionByUserId,
          createdAt: currentDate,
          updatedAt: currentDate,
          status: AgencyJobAssignmentDbStatusEnum.ACTIVE,
        };
      });

    return this.createBulkAgencyJobAssignment(createData);
  }

  async createBulkAgencyJobAssignment(
    validatedRequestBody: DbAgencyJobAssignmentDto[]
  ): Promise<boolean> {
    global.logger.info(`Create Bulk Agency Job Assignment [Service]`, {
      methodName: this.createBulkAgencyJobAssignment.name,
    });

    return agencyJobAssignmentDaoObj.createBulkAgencyJobAssignment(
      validatedRequestBody
    );
  }

  async getBulkAgencyAssignment(
    companyId: string,
    agencyRegisteredEmail: string,
    jobIds: string[]
  ) {
    global.logger.info(`Check Existing Assignments [Service]`, {
      methodName: this.getBulkAgencyAssignment.name,
    });

    return agencyJobAssignmentDaoObj.getBulkAgencyAssignment(
      companyId,
      agencyRegisteredEmail,
      jobIds
    );
  }

  async getAllAgencyJobAssignmentsByFilterOptions(
    filterOptions: AgencyJobAssignmentListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyJobAssignmentDto[]>> {
    return agencyJobAssignmentDaoObj.getAllAgencyJobAssignmentsByFilterOptions(
      filterOptions
    );
  }

  async performGetAllAgencyJobAssignmentsActivities(
    filterOptions: AgencyJobAssignmentListingFilterOptions
  ): Promise<
    GcpFirestoreRecordListingResponseDTO<
      (DbAgencyJobAssignmentDto & { jobDetails?: DbJobAwsOpensearchDto })[]
    >
  > {
    global.logger.info(
      `Perform Get All Agency Job Assignments By Filter Options [Service]`,
      {
        methodName: this.performGetAllAgencyJobAssignmentsActivities.name,
      }
    );

    /**
     * If action by user is "agency", then list job assignments recieved to him for his email
     */
    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();
    const agencyUserDetails: DbAgencyUserDto | undefined =
      await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId
      );
    if (agencyUserDetails) {
      if (!filterOptions.agencyRegisteredEmail) {
        global.logger.info(
          `To list invites to particular agency, agency registeredEmail is required`,
          {
            methodName: this.performGetAllAgencyJobAssignmentsActivities.name,
            filterOptions,
          }
        );
        throw new BaseError(
          "Agency Registered email is required",
          HttpStatusCode.BAD_REQUEST_400
        );
      }

      if (filterOptions.agencyRegisteredEmail !== agencyUserDetails.email) {
        global.logger.info(
          `To list invites to particular agency, agency registeredEmail should match`,
          {
            methodName: this.performGetAllAgencyJobAssignmentsActivities.name,
            filterOptions,
            agencyUserDetails,
            convertedAgencyCognitoUserId,
          }
        );
        throw new BaseError(
          "You are not allowed to access this resource",
          HttpStatusCode.FORBIDDEN_403
        );
      }
    } else {
      global.logger.error(`Agency User Details not found.`, {
        methodName: this.performGetAllAgencyJobAssignmentsActivities.name,
        convertedAgencyCognitoUserId,
      });
      throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
    }

    const { includeJobDetails } = filterOptions;

    if (!includeJobDetails) {
      return this.getAllAgencyJobAssignmentsByFilterOptions(filterOptions);
    }

    // Attach job details to the response
    const { data: agencyJobAssignments, pagination } =
      await agencyJobAssignmentDaoObj.getAllAgencyJobAssignmentsByFilterOptions(
        filterOptions
      );

    const agencyJobAssignmentsWithEntityDetails: (DbAgencyJobAssignmentDto & {
      jobDetails?: DbJobAwsOpensearchDto;
    })[] =
      await injectEntityDetailsGlobalIteratorHelper.injectEntityDetailsForAgencyJobAssignment(
        agencyJobAssignments,
        includeJobDetails
      );

    const finalResponse: GcpFirestoreRecordListingResponseDTO<
      (DbAgencyJobAssignmentDto & {
        jobDetails?: DbJobAwsOpensearchDto;
      })[]
    > = {
      data: agencyJobAssignmentsWithEntityDetails,
      pagination: pagination,
    };

    return finalResponse;
  }

  async getAgencyJobAssignmentByCompIdJobIdAndEmail(
    companyId: string,
    jobId: string,
    agencyRegisteredEmail: string
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info(
      `Get Agency Job Assignment By Comp Id Job Id And Email [Service]`,
      {
        methodName: this.getAgencyJobAssignmentByCompIdJobIdAndEmail.name,
      }
    );

    return agencyJobAssignmentDaoObj.getAgencyJobAssignmentByCompIdJobIdAndEmail(
      companyId,
      jobId,
      agencyRegisteredEmail
    );
  }
}

const agencyJobAssignmentServiceObj = new AgencyJobAssignmentService();
export { agencyJobAssignmentServiceObj, AgencyJobAssignmentService };