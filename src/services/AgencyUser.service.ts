
// Import firestore package
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import cognito clients
import {
  AdminGetUserCommandOutput,
  AttributeType,
} from "@aws-sdk/client-cognito-identity-provider";

// Import configs
import { awsClientCognitoIdentityProviderLibrary } from "../configs/aws-sdk.config";

// Import daos
import { agencyUserDaoObj } from "../daos/AgencyUser.dao";

// Import dtos
import {
  AgencyUserCommonUpdateDto,
  AgencyUserCreateApiDto,
  AgencyUserCreateDto,
} from "../dtos/AgencyUser.dto";

// Import enums
import { AgencyUserInviteDbStatusEnum } from "../enums/AgencyUserInvite.enum";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";
import { getActionByAgencyUserIds } from "../helpers/user.helper";

// Import services
import { agencyUserInviteServiceObj } from "./AgencyUserInvite.service";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyUserService {
  async createAgencyUser(createData: AgencyUserCreateDto): Promise<DbAgencyUserDto | undefined> {
    global.logger.info(`Create Agency User [Service]`, {
      methodName: this.createAgencyUser.name,
    });

    return agencyUserDaoObj.createAgencyUser(createData);
  }

  async getAgencyUserByRegisteredEmail(
    registeredEmail: string
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info(`Get Agency User By Registered Email [Service]`, {
      methodName: this.getAgencyUserByRegisteredEmail.name,
      registeredEmail,
    });
    return agencyUserDaoObj.getAgencyUserByRegisteredEmail(registeredEmail);
  }

  async getAgencyUserById(id: string): Promise<DbAgencyUserDto | undefined> {
    global.logger.info(`Get Agency User By Id [Service]`, {
      methodName: this.getAgencyUserById.name,
      id,
    });
    return agencyUserDaoObj.getAgencyUserById(id);
  }

  async validateAgencyUserAuthAccess(): Promise<DbAgencyUserDto | undefined> {
    const {
      convertedAgencyCognitoUserId,
      agencyCognitoUserId
    } = getActionByAgencyUserIds();

    const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.getAgencyUserById(
      convertedAgencyCognitoUserId
    );

    return agencyUserDetails;
  };

  async updateAgencyUserById(
    id: string,
    data: Partial<AgencyUserCommonUpdateDto>
  ): Promise<DbAgencyUserDto | undefined> {
    global.logger.info(`Update Agency User By Id [Service]`, {
      methodName: this.updateAgencyUserById.name,
      id,
      data,
    });

    return agencyUserDaoObj.updateAgencyUserById(id, data);
  }

  async performCreateAgencyUserActivities(
    validatedRequestBody: AgencyUserCreateApiDto
  ) {
    global.logger.info(`Perform Create Agency User Activities [Service]`, {
      methodName: this.performCreateAgencyUserActivities.name,
    });

    const agencyCognitoUserId: string = global.requestLocalContext.userId;

    const agencyUserPoolId: string | undefined =
      process.env.APP_AWS_AGENCY_COGNITO_USER_POOL_ID;
    if (!agencyUserPoolId) {
      global.logger.error(
        `Missing Agency User Pool Id from environment variables.[SERVICE]`,
        {
          methodName: this.performCreateAgencyUserActivities.name,
          agencyUserPoolId,
        }
      );
      throw new BaseError(
        "Internal Server Error",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    };

    const agencyCognitoUserDetails: AdminGetUserCommandOutput =
      await awsClientCognitoIdentityProviderLibrary.getUserDetails(
        agencyUserPoolId,
        agencyCognitoUserId
      );
    const agencyCognitoUserEmail: string | undefined =
      agencyCognitoUserDetails?.UserAttributes?.find(
        (attr: AttributeType) => attr.Name === "email"
      )?.Value;
    const isAgencyCognitoUserEmailVerified: boolean = 
      agencyCognitoUserDetails?.UserAttributes?.find(
        (attr: AttributeType) => attr.Name === "email_verified"
      )?.Value === "true";

    if (!agencyCognitoUserDetails || !agencyCognitoUserEmail || !isAgencyCognitoUserEmailVerified) {
      global.logger.error(`Cognito User details are not valid.[SERVICE]`, {
        methodName: this.performCreateAgencyUserActivities.name,
        agencyCognitoUserId,
        agencyCognitoUserEmail,
        isAgencyCognitoUserEmailVerified,
        agencyCognitoUserDetails,
      });

      // Give user friendly message
      throw new BaseError(
        `Your SignIn details are not valid.`,
        HttpStatusCode.UNAUTHORIZED_401
      );
    };

    const reqBodyAgencyInviteDetails: DbAgencyUserInviteDto | undefined =
      await agencyUserInviteServiceObj.getAgencyUserInviteById(
        validatedRequestBody.inviteId
      );
    if (!reqBodyAgencyInviteDetails) {
      global.logger.error(`Agency User Invite Details not found.[SERVICE]`, {
        methodName: this.performCreateAgencyUserActivities.name,
        validatedRequestBody,
        reqBodyAgencyInviteDetails,
      });
      throw new BaseError(
        "Your Invite Details not found.",
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const {
      name: reqBodyAgencyInviteName,
      email: reqBodyAgencyInviteEmail,
      phoneNumberDetails: reqBodyAgencyInvitePhoneNumberDetails,
    } = reqBodyAgencyInviteDetails;

    if (reqBodyAgencyInviteEmail !== agencyCognitoUserEmail) {
      global.logger.error(
        `Agency User invite email and Cognito user email does not match.[SERVICE]`,
        {
          methodName: this.performCreateAgencyUserActivities.name,
          validatedRequestBody,
          reqBodyAgencyInviteDetails,
          agencyCognitoUserDetails,
        }
      );
      throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
    }

    const existingAgencyUserDetails: QuerySnapshot<DocumentData, DocumentData> =
      await this.getAgencyUserByRegisteredEmail(agencyCognitoUserEmail);
    if(!existingAgencyUserDetails.empty) {
      global.logger.error(`Agency User already exists.[SERVICE]`, {
        methodName: this.performCreateAgencyUserActivities.name,
        validatedRequestBody,
        existingAgencyUserDetails,
      });
      throw new BaseError(
        "You have already registered as an Agency User.",
        HttpStatusCode.CONFLICT_409
      );
    };

    // Prepare create data
    const createData: AgencyUserCreateDto = {
      cognitoUserId: agencyCognitoUserId,
      email: agencyCognitoUserEmail,
      name: reqBodyAgencyInviteName,
      phoneNumberDetails: reqBodyAgencyInvitePhoneNumberDetails,
      inviteIds: [validatedRequestBody.inviteId],
      isEmailVerified: isAgencyCognitoUserEmailVerified
    };

    const agencyUserDetails: DbAgencyUserDto | undefined = await this.createAgencyUser(createData);
    if (!agencyUserDetails) {
      global.logger.error(`Agency User not created.[SERVICE]`, {
        methodName: this.performCreateAgencyUserActivities.name,
        validatedRequestBody,
        createData,
        agencyUserDetails,
      });
      throw new BaseError(
        "Internal Server Error",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    // Update the invite status to "ACCEPTED"
    const updatedInviteDetails: DbAgencyUserInviteDto | undefined = await agencyUserInviteServiceObj.updateAgencyUserInviteById(
      reqBodyAgencyInviteDetails.id,
      {
        inviteStatus: AgencyUserInviteDbStatusEnum.ACCEPTED,
        updatedAt: dateHelperObj.getISODate(),
        updatedByAgencyUserId: agencyUserDetails.id
      }
    );
    if(!updatedInviteDetails || updatedInviteDetails.inviteStatus !== AgencyUserInviteDbStatusEnum.ACCEPTED) {
      global.logger.error(`Agency User Invite not updated. [SERVICE]`, {
        methodName: this.performCreateAgencyUserActivities.name,
        validatedRequestBody,
        updatedInviteDetails,
      });
      throw new BaseError(
        "Internal Server Error",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    return agencyUserDetails;
  }
}

const agencyUserServiceObj = new AgencyUserService();
export { agencyUserServiceObj, AgencyUserService };
