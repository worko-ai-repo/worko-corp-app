
// Import dtos
import { AgencyUserInviteDbPhoneNumberDto } from "../../dtos/AgencyUserInvite.dto";

// Import enums
import { AgencyUserInviteDbStatusEnum } from "../../enums/AgencyUserInvite.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyUserInviteDto extends BaseFirestoreModel {
  /**
   * @reference "id" attribute of "CorporateUser.model.ts" from "AWS DynamoDB"
   */
  invitedByCorporateUserId: string;

  /**
   * @reference "id" attribute of "CorporateUser.model.ts" from "AWS DynamoDB"
   */
  updatedByCorporateUserId?: string;

  /**
   * @reference "id" attribute of "CompanyDetail.model.ts" from "AWS DynamoDB"
   */
  companyId: string;

  /**
   * @description The name of the person who is being invited
   */
  name: string;

  inviteStatus: AgencyUserInviteDbStatusEnum;

  /**
   * @description The email of the person who is being invited
   */
  email: string;

  /**
   * @description The phone number of the person who is being invited
   */
  phoneNumberDetails: AgencyUserInviteDbPhoneNumberDto;

  GSTIN?: string;

  /**
   * @reference Amazon S3 > Buckets > worko-corporate-{environment}/companies/{companyId}/agency-invites/{agencyInviteId}/contract-copies/
   */
  contractCopyAwsS3FileName?: string;

  contractCopyUserFileName?: string;
}

export { DbAgencyUserInviteDto };