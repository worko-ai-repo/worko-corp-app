
// Import dynamoose 
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import dtos
import { agencyJobAssignmentDaoObj } from "../daos/AgencyJobAssignment.dao";

// Import dtos
import { AgencyJobAssignmentBulkCreateApiDto, AgencyJobAssignmentBulkRemoveJobsUpdateApiDto, AgencyJobAssignmentListingFilterOptions } from "../dtos/AgencyJobAssignment.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import enums
import { AgencyJobAssignmentDbStatusEnum } from "../enums/AgencyJobAssignment.enum";
import { AgencyUserInviteDbStatusEnum } from "../enums/AgencyUserInvite.enum";

// Import helpers
import { getActionByAgencyUserIds, getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";
import { injectEntityDetailsHelperObj } from "../helpers/injectEntityDetails.helper";

// Import models
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";
import { DbGcpFirestoreJobDto } from "../db/gcp-firestore-models/GcpFirestoreJob.model";
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

      if (
        reqBodyCompanyId !== agencyUserInviteDetails.companyId
      ) {
        global.logger.error(
          `The agency invite is not associated with the company.`,
          {
            validatedRequestBody,
            agencyUserInviteDetails,
            methodName:
              this.performCreateBulkAgencyJobAssignmentActivities.name,
          }
        );
        throw new BaseError(
          `The agency invite is not associated with the company you are trying to perform this action.`,
          HttpStatusCode.FORBIDDEN_403
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

    const reqBodyJobIdsToAssign: string[] = validatedRequestBody.jobsToAssign.map(
      (eachJob: {
        jobId: string;
        jobTitle: string;
      }) => eachJob.jobId
    );

    /**
     * Check whether any one of the job is already assigned to this `agency` or not by using `companyId`, `jobId`, `agencyRegisteredEmail`
     */
    const existingAssignments: QuerySnapshot<DocumentData, DocumentData> =
      await this.getBulkAgencyAssignment(
        reqBodyCompanyId,
        reqBodyAgencyEmail,
        reqBodyJobIdsToAssign
      );

    if (!existingAssignments.empty) {
      throw new BaseError(
        `Few jobs are already assigned to this agency, so check and try again.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    const currentDate: string = dateHelperObj.getISODate();
    const agencyJobAssignmentIds: string[] = [];
    const createData: DbAgencyJobAssignmentDto[] =
      validatedRequestBody.jobsToAssign.map((eachJob: { jobId: string; jobTitle: string; }) => {
        const agencyJobAssignmentDocId: string = UlidService.getUlidId();
        agencyJobAssignmentIds.push(agencyJobAssignmentDocId);
        return {
          companyId: reqBodyCompanyId,
          agencyRegisteredEmail: reqBodyAgencyEmail,
          jobId: eachJob.jobId,
          jobTitle: eachJob.jobTitle,
          id: agencyJobAssignmentDocId,
          assignedByCorporateUserId: actionByCorporateUserId,
          assignedByUserId: actionByUserId,
          agencyUserInviteId: reqBodyAgencyInviteId,
          createdAt: currentDate,
          updatedAt: currentDate,
          status: AgencyJobAssignmentDbStatusEnum.ACTIVE,
        };
      });

    const result: boolean = await this.createBulkAgencyJobAssignment(createData);
    if(result) {
      // Update jobs assigned count to agency invite
      const updatedInviteDetails: DbAgencyUserInviteDto | undefined =
        await agencyUserInviteServiceObj.updateAgencyUserInviteById(
          reqBodyAgencyInviteId,
          {
            updatedAt: currentDate,
            totalAssignedJobs: (agencyUserInviteDetails?.totalAssignedJobs ?? 0) + validatedRequestBody.jobsToAssign.length,
            agencyJobAssignmentIds: [...(agencyUserInviteDetails?.agencyJobAssignmentIds ?? []), ...agencyJobAssignmentIds],
          }
        );
    } else {
      global.logger.error(
        `Failed to create bulk agency job assignment, so we are not updating the counts of job assigned to agency [Service]`,
        {
          methodName: this.performCreateBulkAgencyJobAssignmentActivities.name,
        }
      )
    }

    return result;
  }

  async removeBulkAgencyJobAssignment(validatedRequestBody: AgencyJobAssignmentBulkRemoveJobsUpdateApiDto): Promise<boolean> {
    global.logger.info(`Remove Bulk Agency Job Assignment [Service]`, {
      methodName: this.removeBulkAgencyJobAssignment.name,
    });

    const { actionByCorporateUserId } = getActionByUserId();
    if(!actionByCorporateUserId) {
      throw new BaseError(
        `Unauthorized.`,
        HttpStatusCode.UNAUTHORIZED_401
      );
    }

    const agencyUserInviteDetails: DbAgencyUserInviteDto | undefined = await agencyUserInviteServiceObj.getAgencyUserInviteById(validatedRequestBody.agencyUserInviteId);
    if(!agencyUserInviteDetails) {
      throw new BaseError(
        `Agency User Invite Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    if(agencyUserInviteDetails.invitedByCorporateUserId !== actionByCorporateUserId) {
      global.logger.error(`Action by corporate user id not match with invited by corporate user id, so you are not allowed to perform this action.`, {
        methodName: this.removeBulkAgencyJobAssignment.name,
        actionByCorporateUserId,
        agencyUserInviteDetails
      })
      throw new BaseError(
        `You are not allowed to perform this action.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    const result: boolean = await this.updateBulkAgencyJobAssignmentByIds(
      validatedRequestBody.agencyJobAssignmentIdsToRemove,
      {
        status: AgencyJobAssignmentDbStatusEnum.INACTIVE,
        updatedAt: dateHelperObj.getISODate(),
        updatedByCorporateUserId: actionByCorporateUserId
      }
    );

    if(result) {
      let totalAssignedJobs: number | undefined;
      if(agencyUserInviteDetails.totalAssignedJobs) {
        if(agencyUserInviteDetails.totalAssignedJobs >= validatedRequestBody.agencyJobAssignmentIdsToRemove.length) {
          totalAssignedJobs = agencyUserInviteDetails.totalAssignedJobs - validatedRequestBody.agencyJobAssignmentIdsToRemove.length;
          await agencyUserInviteServiceObj.updateAgencyUserInviteById(validatedRequestBody.agencyUserInviteId, {
            updatedAt: dateHelperObj.getISODate(),
            updatedByCorporateUserId: actionByCorporateUserId,
            totalAssignedJobs
          })
        }
      }
    }

    /**
     * @todo: 
     *  1. We need to use `reasonForRemoval` to send email to that particular agency.
     */

    return result;
  }

  async updateBulkAgencyJobAssignmentByIds(
    ids: string[],
    updateData: Partial<DbAgencyJobAssignmentDto>,
  ): Promise<boolean> {
    return agencyJobAssignmentDaoObj.updateBulkAgencyJobAssignmentByIds(ids, updateData);
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
      (DbAgencyJobAssignmentDto & { jobDetails?: DbGcpFirestoreJobDto })[]
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
          `To list agency job assignments to particular agency, agency registeredEmail is required`,
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
          `To list agency job assignments to particular agency, agency registeredEmail should match`,
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
      const {actionByCorporateUserId, actionByUserId} = getActionByUserId();
      if(actionByUserId) {
        throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
      } else if(actionByCorporateUserId) {
        if(!filterOptions.companyId) {
          throw new BaseError("Company id is required", HttpStatusCode.BAD_REQUEST_400);
        }

        if(!filterOptions.assignedByCorporateUserId) {
          throw new BaseError("Assigned by corporate user id is required", HttpStatusCode.BAD_REQUEST_400);
        }
      } else {
        throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
      }
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
      jobDetails?: DbGcpFirestoreJobDto;
    })[] =
      await injectEntityDetailsHelperObj.injectEntityDetailsForAgencyJobAssignment(
        agencyJobAssignments,
        includeJobDetails
      );

    const finalResponse: GcpFirestoreRecordListingResponseDTO<
      (DbAgencyJobAssignmentDto & {
        jobDetails?: DbGcpFirestoreJobDto;
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

  async updateAgencyJobAssignmentById(
    id: string,
    updateData: Partial<DbAgencyJobAssignmentDto>
  ): Promise<DbAgencyJobAssignmentDto | undefined> {
    return agencyJobAssignmentDaoObj.updateAgencyJobAssignmentById(id, updateData);
  }
}

const agencyJobAssignmentServiceObj = new AgencyJobAssignmentService();
export { agencyJobAssignmentServiceObj, AgencyJobAssignmentService };