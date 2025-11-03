
// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import firestore types
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import daos
import { agencyUserInviteDaoObj } from "../daos/AgencyUserInvite.dao";
import { agencyUserDaoObj } from "../daos/AgencyUser.dao";

// Import dtos
import { AgencyUserInviteCommonUpdateDto, AgencyUserInviteCreateApiDto, AgencyUserInviteCreateDto, AgencyUserInviteUpdateApiDto } from "../dtos/AgencyUserInvite.dto";

// Import enums
import { AgencyUserInviteDbStatusEnum } from "../enums/AgencyUserInvite.enum";

// Import helpers
import { getActionByUserId } from "../helpers/user.helper";

// Import models
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";

// Import services
import { companyDetailServiceObj } from "./CompanyDetail.service";
import { corporateUserServiceObj } from "./CorporateUser.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";
import { dateHelperObj } from "../helpers/date.helper";

class AgencyUserInviteService {
  async createAgencyUserInvite(
    createDto: AgencyUserInviteCreateDto
  ): Promise<DbAgencyUserInviteDto | undefined> {
    global.logger.info(`Create Agency User Invite [Service]`, {
      methodName: this.createAgencyUserInvite.name,
    });

    return agencyUserInviteDaoObj.createAgencyUserInvite(createDto);
  }

  async getAllAgencyUserInvitesByFilterOptions() {
    global.logger.info(`Get All Agency User Invites [Service]`, {
      methodName: this.getAllAgencyUserInvitesByFilterOptions.name,
    })
  }

  async getAgencyUserInviteByCompIdEmailAndInvitedByUserId(
    companyId: string,
    agencyInvitedEmail: string,
    invitedByCorporateUserId: string
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info(`Get Agency User Invite [Service]`, {
      methodName: this.getAgencyUserInviteByCompIdEmailAndInvitedByUserId.name,
    });

    return agencyUserInviteDaoObj.getAgencyUserInviteByCompIdEmailAndInvitedByUserId(
      companyId,
      agencyInvitedEmail,
      invitedByCorporateUserId
    );
  }

  async getAgencyUserInviteById(
    id: string
  ): Promise<DbAgencyUserInviteDto | undefined> {
    global.logger.info(`Get Agency User Invite [Service]`, {
      methodName: this.getAgencyUserInviteById.name,
    });

    return agencyUserInviteDaoObj.getAgencyUserInviteById(id);
  }

  async updateAgencyUserInviteById(
    id: string,
    data: Partial<AgencyUserInviteCommonUpdateDto>
  ): Promise<DbAgencyUserInviteDto | undefined> {
    global.logger.info("Update Agency User Invite By Id [Service]");

    return agencyUserInviteDaoObj.updateAgencyUserInviteById(id, data);
  }

  async performCreateAgencyUserInviteActivities(
    validatedRequestBody: AgencyUserInviteCreateApiDto
  ) {
    global.logger.info(
      `Perform Create Agency User Invite Activities [Service]`,
      {
        methodName: this.performCreateAgencyUserInviteActivities.name,
      }
    );

    const requestBodyCompanyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(
        validatedRequestBody.companyId
      );
    if (!requestBodyCompanyDetails.count) {
      throw new BaseError(
        `Company Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const { actionByCorporateUserId } = getActionByUserId();
    if (!actionByCorporateUserId) {
      global.logger.error(`Action by corporate user id not found.`, {
        methodName: this.performCreateAgencyUserInviteActivities.name,
      });
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }

    const corporateUserDetails: QueryResponse<DbCorporateUserDto> =
      await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
    if (!corporateUserDetails.count) {
      throw new BaseError(
        `Corporate User Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }
    const corporateUserData = corporateUserDetails[0];
    if (corporateUserData.companyId !== validatedRequestBody.companyId) {
      global.logger.error(
        `Different companies in request body and corporate user data.`,
        {
          methodName: this.performCreateAgencyUserInviteActivities.name,
          validatedRequestBody,
          corporateUserData,
        }
      );
      throw new BaseError(
        `You are not allowed to access this resource.`,
        HttpStatusCode.FORBIDDEN_403
      );
    }

    // Get the agency invite details by `companyId`,`agencyEmail`, `invitedByCorporateUserId`
    const existingAgencyUserInviteDetails: QuerySnapshot<
      DocumentData,
      DocumentData
    > = await this.getAgencyUserInviteByCompIdEmailAndInvitedByUserId(
      validatedRequestBody.companyId,
      validatedRequestBody.email,
      actionByCorporateUserId
    );

    global.logger.info(`Existing Agency User Invite [Service]`, {
      methodName: this.performCreateAgencyUserInviteActivities.name,
      size: existingAgencyUserInviteDetails.size,
      empty: existingAgencyUserInviteDetails.empty,
    });

    if (!existingAgencyUserInviteDetails.empty) {
      const existingDocs: DocumentData =
        existingAgencyUserInviteDetails.docs[0].data();
      global.logger.info(`Existing Agency User Invite Data [Service]`, {
        methodName: this.performCreateAgencyUserInviteActivities.name,
        existingDocs,
      });
      throw new BaseError(
        `Agency User Invite already exists.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    // Prepare the create invite dto
    const createInviteDto: AgencyUserInviteCreateDto = {
      ...validatedRequestBody,
      invitedByCorporateUserId: actionByCorporateUserId,
      inviteStatus: AgencyUserInviteDbStatusEnum.AWAITING,
    };

    const createdInviteDetails: DbAgencyUserInviteDto | undefined =
      await this.createAgencyUserInvite(createInviteDto);
    if (!createdInviteDetails) {
      global.logger.error(`Failed to Create Agency User Invite [Service]`, {
        methodName: this.performCreateAgencyUserInviteActivities.name,
        createdInviteDetails,
        createInviteDto,
      });
      throw new BaseError(
        `Failed to Send Agency User Invite.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    /*
    Get Agency Registered details
      1. If Agency is already registered:
        1. Send Email to `agency` with Login url
      2. If Agency is not registered:
        1. Send Email to `agency` with Register url
    */
    const existingAgencyUserDetails: QuerySnapshot<DocumentData, DocumentData> =
      await agencyUserDaoObj.getAgencyUserByRegisteredEmail(
        validatedRequestBody.email
      );
    if (!existingAgencyUserDetails.empty) {
      global.logger.info(`Existing Agency User [Service]`, {
        methodName: this.performCreateAgencyUserInviteActivities.name,
      });
      const existingAgencyUserData =
        existingAgencyUserDetails.docs[0].data() as DbAgencyUserDto;

      // Update the `inviteId` in `inviteIds` field in `AgencyUser` collection
      const updatedAgencyUserDetails: DbAgencyUserDto | undefined =
        await agencyUserDaoObj.updateAgencyUserById(existingAgencyUserData.id, {
          inviteIds: [
            ...existingAgencyUserData.inviteIds,
            createdInviteDetails.id,
          ],
        });
      if (!updatedAgencyUserDetails) {
        global.logger.error(
          `Failed to Update Agency User with inviteIds [Service]`,
          {
            methodName: this.performCreateAgencyUserInviteActivities.name,
            updatedAgencyUserDetails,
          }
        );
        throw new BaseError(
          `Failed to Send Agency User Invite.`,
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }

      // Send Email to `agency` with Login url
    } else {
      // Send Email to `agency` with Register url
    }

    return createdInviteDetails;
  }

  async performUpdateAgencyUserInviteActivities(
    validatedRequestBody: AgencyUserInviteUpdateApiDto
  ) {
    global.logger.info(`Perform Update Agency User Invite [Service]`, {
      methodName: this.performUpdateAgencyUserInviteActivities.name,
    });

    const { actionByCorporateUserId } = getActionByUserId();
    if (!actionByCorporateUserId) {
      global.logger.error(`Action by corporate user id not found.`, {
        methodName: this.performCreateAgencyUserInviteActivities.name,
        actionByCorporateUserId,
        validatedRequestBody,
      });
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }

    const corporateUserDetails: QueryResponse<DbCorporateUserDto> =
      await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
    if (!corporateUserDetails.count) {
      throw new BaseError(
        `Corporate User Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const existingInviteDetails: DbAgencyUserInviteDto | undefined =
      await this.getAgencyUserInviteById(validatedRequestBody.agencyInviteId);
    if (!existingInviteDetails) {
      throw new BaseError(
        `Agency User Invite Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    if (
      existingInviteDetails.invitedByCorporateUserId !== actionByCorporateUserId
    ) {
      global.logger.error(
        `The action by corporate user id does not match the invited by corporate user id.`,
        {
          methodName: this.performCreateAgencyUserInviteActivities.name,
          existingInviteDetails,
          actionByCorporateUserId,
        }
      );
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    };

    const {agencyInviteId, ...remainingValidatedData} = validatedRequestBody;

    // Prepare update data
    const updateData: Partial<AgencyUserInviteCommonUpdateDto> = {
      ...remainingValidatedData,
      updatedByCorporateUserId: actionByCorporateUserId,
      updatedAt: dateHelperObj.getISODate(),
    };

    const updatedInviteDetails: DbAgencyUserInviteDto | undefined =
      await this.updateAgencyUserInviteById(existingInviteDetails.id, updateData);
    if (!updatedInviteDetails) {
      global.logger.error(`Failed to Update Agency User Invite [Service]`, {
        methodName: this.performUpdateAgencyUserInviteActivities.name,
        updatedInviteDetails,
        updateData,
      });
      throw new BaseError(
        `Failed to Update Agency User Invite.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    return updatedInviteDetails;
  }
}

const agencyUserInviteServiceObj = new AgencyUserInviteService();
export { agencyUserInviteServiceObj, AgencyUserInviteService };