// Import dtos
import { CommonPhoneNumberDto } from "./Common.dto";

export interface AgencyUserCreateApiDto {
  /**
   * @referenc "id" field of "AgencyUserInvite.model.ts"
   */
  inviteId: string;
}

export interface AgencyUserCreateDto {
  cognitoUserId: string;
  email: string;
  name: string;
  phoneNumberDetails: AgencyUserDbPhoneNumberDto;

  /**
   * @reference `id` field of `AgencyUserInvite.model.ts`
   */
  inviteIds: string[];

  /**
   * @description If email is verified in cognito then this will be `true`, otherwise `false`
   * @reference "Email verified" column in "Amazon Cognito > User pools > {YourUserPoolName} > Users"
   */
  isEmailVerified: boolean;
}

export interface AgencyUserCommonUpdateDto {
  updatedAt: string;
  inviteIds: string[];
}

export interface AgencyUserDbPhoneNumberDto extends CommonPhoneNumberDto {}