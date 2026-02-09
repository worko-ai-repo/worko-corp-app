
// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import firestore types
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import daos
import { agencyUserInviteDaoObj } from "../daos/AgencyUserInvite.dao";
import { agencyUserDaoObj } from "../daos/AgencyUser.dao";

// Import dtos
import {  AgencyUserInviteCreateApiDto, AgencyUserInviteCreateDto, AgencyUserInviteDbPhoneNumberDto, AgencyUserInviteListingFilterOptions, AgencyUserInviteCorpUpdateApiDto, AgencyUserInviteAgencyUpdateApiDto, AgencyUserInviteActionUpdateApiDto } from "../dtos/AgencyUserInvite.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import { EmailTemplatePlaceholderAGENCY_INVITE_FOR_REGISTERED, EmailTemplatePlaceholderAGENCY_INVITE_FOR_UNREGISTERED } from "../dtos/EmailTemplatePlaceholder.dto";

// Import enums
import { AgencyUserInviteDbActionEnum, AgencyUserInviteDbStatusEnum } from "../enums/AgencyUserInvite.enum";
import { EmailTemplateEnum } from "../enums/EmailTemplate.enum";

// Import helpers
import { getActionByAgencyUserIds, getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import libraries
import {
  emailLibrary,
  EmailSourceDestinationAddress,
} from "../libraries/email.library";

// Import models
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";

// Import services
import { companyDetailServiceObj } from "./CompanyDetail.service";
import { corporateUserServiceObj } from "./CorporateUser.service";
import { agencyUserServiceObj } from "./AgencyUser.service";
import { agencyUserSubmissionServiceObj } from "./AgencyUserSubmission.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";


class AgencyUserInviteService {
  async createAgencyUserInvite(
    createDto: AgencyUserInviteCreateDto
  ): Promise<DbAgencyUserInviteDto | undefined> {
    global.logger.info(`Create Agency User Invite [Service]`, {
      methodName: this.createAgencyUserInvite.name,
    });

    return agencyUserInviteDaoObj.createAgencyUserInvite(createDto);
  }

  async performGetAllAgencyUserInviteActivities(
    filterOptions: AgencyUserInviteListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyUserInviteDto[]>> {
    /**
     * If action by user is "agency", then list invites to recieved to him for his email
     */
    const {convertedAgencyCognitoUserId} = getActionByAgencyUserIds();
    const agencyUserDetails: DbAgencyUserDto | undefined = await agencyUserServiceObj.getAgencyUserById(convertedAgencyCognitoUserId);
    if(agencyUserDetails) {
      if(!filterOptions.agencyEmail) {
        global.logger.info(`To list invites to particular agency, agencyEmail is required`, {
          methodName: this.performGetAllAgencyUserInviteActivities.name,
          filterOptions
        });
        throw new BaseError('Agency email is required', HttpStatusCode.BAD_REQUEST_400);
      }

      if(filterOptions.agencyEmail !== agencyUserDetails.email) {
        global.logger.info(`To list invites to particular agency, agencyEmail should match`, {
          methodName: this.performGetAllAgencyUserInviteActivities.name,
          filterOptions,
          agencyUserDetails,
          convertedAgencyCognitoUserId
        });
        throw new BaseError("You are not allowed to access this resource", HttpStatusCode.FORBIDDEN_403);
      }

      return this.getAllAgencyUserInvitesByFilterOptions(filterOptions);
    }

    const {actionByCorporateUserId} = getActionByUserId();

    /**
     * If action by user is "corporate-admin/recruiter", then list invites which are sent by him and from his company
     */
    if(actionByCorporateUserId) {
      if(!filterOptions.invitedByCorporateUserId) {
        global.logger.info(`To list invites sent by particular corporate user, invitedByCorporateUserId is required`, {
          methodName: this.performGetAllAgencyUserInviteActivities.name,
          filterOptions
        });
        throw new BaseError('Invited by corporate user id is required', HttpStatusCode.BAD_REQUEST_400);
      }

      if(filterOptions.invitedByCorporateUserId !== actionByCorporateUserId) {
        global.logger.info(`To list invites sent by particular corporate user, invitedByCorporateUserId should match`, {
          methodName: this.performGetAllAgencyUserInviteActivities.name,
          filterOptions,
          actionByCorporateUserId
        });
        throw new BaseError("You are not allowed to access this resource", HttpStatusCode.FORBIDDEN_403);
      }

      if(!filterOptions.companyId) {
        global.logger.info(`To list invites sent by particular corporate user, companyId is required`, {
          methodName: this.performGetAllAgencyUserInviteActivities.name,
          filterOptions
        });
        throw new BaseError('Company id is required', HttpStatusCode.BAD_REQUEST_400);
      }

      const corporateUserDetails: QueryResponse<DbCorporateUserDto> = await corporateUserServiceObj.getCorpUserById(actionByCorporateUserId);
      if(!corporateUserDetails.count) {
        throw new BaseError(`Corporate User Details not found.`, HttpStatusCode.NOT_FOUND_404);
      }
      const corporateUserData: DbCorporateUserDto = corporateUserDetails[0];

      if(filterOptions.companyId !== corporateUserData.companyId) {
        global.logger.info(`To list invites sent by particular corporate user, companyId should match`, {
          methodName: this.performGetAllAgencyUserInviteActivities.name,
          filterOptions,
          corporateUserData
        });
        throw new BaseError("You are not allowed to access this resource", HttpStatusCode.FORBIDDEN_403);
      }

      return this.getAllAgencyUserInvitesByFilterOptions(filterOptions);
    }

    /**
     * If action by user is "admin", then list all invites
     */
    return this.getAllAgencyUserInvitesByFilterOptions(filterOptions);
  }

  async getAllAgencyUserInvitesByFilterOptions(
    filterOptions: AgencyUserInviteListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyUserInviteDto[]>> {
    global.logger.info(`Get All Agency User Invites [Service]`, {
      methodName: this.getAllAgencyUserInvitesByFilterOptions.name,
    });

    return agencyUserInviteDaoObj.getAllAgencyUserInvitesByFilterOptions(
      filterOptions
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
    data: Partial<DbAgencyUserInviteDto>
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

    const {
      companyId: reqCompanyId,
      email: reqAgencyInvitedEmail,
      phoneNumberDetails: reqPhoneNumberDetails,
      name: reqName,
      agencyName: reqAgencyName,
      GSTIN: reqGSTIN
    } = validatedRequestBody;

    const requestBodyCompanyDetails: QueryResponse<DbCompanyDetailDto> =
      await companyDetailServiceObj.getCompanyDetailById(
        reqCompanyId
      );
    if (!requestBodyCompanyDetails.count) {
      throw new BaseError(
        `Company Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    const requestBodyCompanyData: DbCompanyDetailDto =
      requestBodyCompanyDetails[0];

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
    const corporateUserData: DbCorporateUserDto = corporateUserDetails[0];
    if (corporateUserData.companyId !== reqCompanyId) {
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

    // Get the agency invite details by `companyId`,`agencyEmail`
    const existingAgencyUserInviteDetails: QuerySnapshot<
      DocumentData,
      DocumentData
    > =
      await agencyUserInviteDaoObj.getAgencyUserInviteDuplicateDataBeforeCreate(
        validatedRequestBody
      );

    global.logger.info(`Existing Agency User Invite [Service]`, {
      methodName: this.performCreateAgencyUserInviteActivities.name,
      size: existingAgencyUserInviteDetails.size,
      empty: existingAgencyUserInviteDetails.empty,
    });

    if (!existingAgencyUserInviteDetails.empty) {
      const existingDocs = existingAgencyUserInviteDetails.docs[0].data() as DbAgencyUserInviteDto;
      global.logger.info(`Existing Agency User Invite Data [Service]`, {
        methodName: this.performCreateAgencyUserInviteActivities.name,
        existingDocs,
      });

      const duplicateValues: string[] = [];

      if(existingDocs.email === reqAgencyInvitedEmail) {
        duplicateValues.push('email')
      }

      if(existingDocs.companyEmailDomainName === reqAgencyInvitedEmail.split("@")[1]) {
        duplicateValues.push('companyEmailDomainName')
      }

      if(existingDocs.phoneNumberDetails.number === reqPhoneNumberDetails.number && existingDocs.phoneNumberDetails.countryCode === reqPhoneNumberDetails.countryCode) {
        duplicateValues.push('phoneNumberDetails')
      }

      if(existingDocs.GSTIN && reqGSTIN) {
        if(existingDocs.GSTIN !== reqGSTIN) {
          duplicateValues.push('GSTIN')
        }
      }

      if(existingDocs.agencyName === reqAgencyName) {
        duplicateValues.push('agencyName')
      }

      throw new BaseError(
        `An Agency User Invite with ${duplicateValues.join(', ')} already exists.`,
        HttpStatusCode.CONFLICT_409
      );
    }

    // Prepare the create invite dto
    const createInviteDto: AgencyUserInviteCreateDto = {
      ...validatedRequestBody,
      invitedByCorporateUserId: actionByCorporateUserId,
      inviteStatus: AgencyUserInviteDbStatusEnum.AWAITING,
      companyName: requestBodyCompanyData.name,
      inviterName: `${corporateUserData.firstName} ${corporateUserData.lastName}`,
    };

    // Extract the domain
    const emailDomain: string = validatedRequestBody.email.split("@")[1];

    // Check if domain is casual or company
    if (APP_CONSTANTS.CASUAL_EMAIL_DOMAINS.includes(emailDomain)) {
      createInviteDto.miscellaneousEmailDomainName = emailDomain;
    } else {
      createInviteDto.companyEmailDomainName = emailDomain;
    }

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
    const { email: agencyUserEmail, name: agencyUserName } =
      createdInviteDetails;

    const toEvaluatorAddress: EmailSourceDestinationAddress = {
      email: agencyUserEmail,
      fullName: agencyUserName,
    };

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
      const emailToPlaceholders: EmailTemplatePlaceholderAGENCY_INVITE_FOR_REGISTERED =
        {
          agencyUserName: agencyUserName,
          agencyLoginUrl: APP_CONSTANTS.FRONTEND_URLS.WORKO_AGENCY_LOGIN_URL,
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      const emailSendResponse: {
        awsMessageId: string | null;
        systemLogId: string | null;
      } = await emailLibrary.sendEmail(
        EmailTemplateEnum.AGENCY_INVITE_FOR_REGISTERED,
        toEvaluatorAddress,
        emailToPlaceholders
      );

      if (!emailSendResponse.awsMessageId) {
        throw new BaseError(
          `Failed to Send Login Email to Agency User.`,
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }
    } else {
      // Send Email to `agency` with Register url
      const emailToPlaceholders: EmailTemplatePlaceholderAGENCY_INVITE_FOR_UNREGISTERED =
        {
          agencyUserName: agencyUserName,

          companyName: requestBodyCompanyData.name.toTitleCase(),

          agencySignupUrl:
            APP_CONSTANTS.FRONTEND_URLS.WORKO_AGENCY_SIGNUP_URL.strtr({
              "{agencyUserInviteId}": createdInviteDetails.id,
            }),
          ...APP_CONSTANTS.GET_WORKO_SOCIAL_PROFILES_TO_SEND_EMAIL,
        };

      const emailSendResponse: {
        awsMessageId: string | null;
        systemLogId: string | null;
      } = await emailLibrary.sendEmail(
        EmailTemplateEnum.AGENCY_INVITE_FOR_UNREGISTERED,
        toEvaluatorAddress,
        emailToPlaceholders
      );

      if (!emailSendResponse.awsMessageId) {
        throw new BaseError(
          `Failed to Send Register Email to Agency User.`,
          HttpStatusCode.INTERNAL_SERVER_ERROR_500
        );
      }
    }

    return createdInviteDetails;
  }

  async performUpdateAgencyUserInviteActivitiesByCorpUser(
    validatedRequestBody: AgencyUserInviteCorpUpdateApiDto
  ) {
    global.logger.info(`Perform Update Agency User Invite [Service]`, {
      methodName: this.performUpdateAgencyUserInviteActivitiesByCorpUser.name,
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
    }

    if(existingInviteDetails.agencyName === validatedRequestBody.agencyName) {
      throw new BaseError("Agency name is already same.", HttpStatusCode.BAD_REQUEST_400);
    }

    const { agencyInviteId, ...remainingValidatedData } = validatedRequestBody;

    // Prepare update data
    const updateData: Partial<DbAgencyUserInviteDto> = {
      ...remainingValidatedData,
      updatedByCorporateUserId: actionByCorporateUserId,
      updatedAt: dateHelperObj.getISODate(),
    };

    const updatedInviteDetails: DbAgencyUserInviteDto | undefined =
      await this.updateAgencyUserInviteById(
        existingInviteDetails.id,
        updateData
      );
    if (!updatedInviteDetails) {
      global.logger.error(`Failed to Update Agency User Invite [Service]`, {
        methodName: this.performUpdateAgencyUserInviteActivitiesByCorpUser.name,
        updatedInviteDetails,
        updateData,
      });
      throw new BaseError(
        `Failed to Update Agency User Invite.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }

    if(validatedRequestBody.agencyName) {
      if(updatedInviteDetails.agencyUserSubmissionIds && updatedInviteDetails.agencyUserSubmissionIds.length > 0) {
        await agencyUserSubmissionServiceObj.updateBulkAgencyUserSubmissionByIds(
          updatedInviteDetails.agencyUserSubmissionIds,
          { agencyName: validatedRequestBody.agencyName }
        );
      }
    }

    return updatedInviteDetails;
  }

  async performUpdateAgencyUserInviteActionActivities(
    validatedRequestBody: AgencyUserInviteActionUpdateApiDto
  ) {
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
        HttpStatusCode.NOT_FOUND_404,
      );
    }
    const corporateUserData: DbCorporateUserDto = corporateUserDetails[0];

    const existingInviteDetails: DbAgencyUserInviteDto | undefined =
      await this.getAgencyUserInviteById(validatedRequestBody.agencyInviteId);
    if (!existingInviteDetails) {
      throw new BaseError(
        `Agency User Invite Details not found.`,
        HttpStatusCode.NOT_FOUND_404,
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
        },
      );
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }

    if(existingInviteDetails.inviteAction === validatedRequestBody.inviteAction) {
      throw new BaseError(`Invite is already in ${validatedRequestBody.inviteAction.toTitleCase()} state.`, HttpStatusCode.BAD_REQUEST_400);
    }

    if(existingInviteDetails.inviteAction === AgencyUserInviteDbActionEnum.DELETE) {
      throw new BaseError(`Invite is already deleted, so it cannot be updated to ${validatedRequestBody.inviteAction.toTitleCase()} state.`, HttpStatusCode.BAD_REQUEST_400);
    }

    const updatedAt: string = dateHelperObj.getISODate();

    // Prepare update data
    const updateData: Partial<DbAgencyUserInviteDto> = {
      inviteAction: validatedRequestBody.inviteAction,
      inviteActionTracker: [
        ...(existingInviteDetails.inviteActionTracker || []),
        {
          oldAction: existingInviteDetails.inviteAction,
          newAction: validatedRequestBody.inviteAction,
          reason: validatedRequestBody.reason,
          detailedDescription: validatedRequestBody.detailedDescription,
          actionByCorporateUserId,
          actionDate: updatedAt,
          actionByUserType: corporateUserData.corporateUserType,
        },
      ],
      updatedByCorporateUserId: actionByCorporateUserId,
      updatedAt,
    };

    const updatedInviteDetails: DbAgencyUserInviteDto | undefined =
      await this.updateAgencyUserInviteById(
        existingInviteDetails.id,
        updateData,
      );
    if (!updatedInviteDetails) {
      global.logger.error(`Failed to Update Agency User Invite [Service]`, {
        methodName: this.performUpdateAgencyUserInviteActivitiesByCorpUser.name,
        updatedInviteDetails,
        updateData,
      });
      throw new BaseError(
        `Failed to Update Agency User Invite.`,
        HttpStatusCode.INTERNAL_SERVER_ERROR_500,
      );
    }

    return updatedInviteDetails;
  }

  async performUpdateAgencyUserInviteActivitiesByAgencyUser(
    validatedRequestBody: AgencyUserInviteAgencyUpdateApiDto
  ) {
    global.logger.info(`Perform Update Agency User Invite [Service]`, {
      methodName: this.performUpdateAgencyUserInviteActivitiesByAgencyUser.name,
    });

    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();

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

    const existingInviteDetails: DbAgencyUserInviteDto | undefined =
      await this.getAgencyUserInviteById(validatedRequestBody.agencyInviteId);
    if (!existingInviteDetails) {
      throw new BaseError(
        `Agency User Invite Details not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    if (agencyUserDetails.email !== existingInviteDetails.email) {
      global.logger.error(
        `The action by agency user email does not match the invited by agency user email.`,
        {
          methodName:
            this.performUpdateAgencyUserInviteActivitiesByAgencyUser.name,
          existingInviteDetails,
          actionByAgencyUserId: convertedAgencyCognitoUserId,
        }
      );
      throw new BaseError(
        "You are not allowed to perform action on this invite.",
        HttpStatusCode.FORBIDDEN_403
      );
    }

    if(existingInviteDetails.inviteStatus !== AgencyUserInviteDbStatusEnum.AWAITING) {
      global.logger.error(
        `You can only update the invite in AWAITING status.`,
        {
          methodName:
            this.performUpdateAgencyUserInviteActivitiesByAgencyUser.name,
          existingInviteDetails,
          actionByAgencyUserId: convertedAgencyCognitoUserId,
        }
      );
      throw new BaseError(
        "You are not allowed to update this invite.",
        HttpStatusCode.FORBIDDEN_403
      );
    }

    const { agencyInviteId, ...remainingValidatedData } = validatedRequestBody;

    // Prepare update data
    const updateData: Partial<DbAgencyUserInviteDto> = {
      ...remainingValidatedData,
      updatedByAgencyUserId: convertedAgencyCognitoUserId,
      updatedAt: dateHelperObj.getISODate(),
    };

    const updatedInviteDetails: DbAgencyUserInviteDto | undefined =
      await this.updateAgencyUserInviteById(
        existingInviteDetails.id,
        updateData
      );
    if (!updatedInviteDetails) {
      global.logger.error(`Failed to Update Agency User Invite [Service]`, {
        methodName: this.performUpdateAgencyUserInviteActivitiesByCorpUser.name,
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