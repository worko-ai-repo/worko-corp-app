
// Import enums
import { AgencyUserInviteDbStatusEnum } from "../enums/AgencyUserInvite.enum";

export interface AgencyUserInviteCreateApiDto {
   name: string;
   email: string;
   phoneNumberDetails: AgencyUserInviteDbPhoneNumberDto;
   companyId: string;
   GSTIN?: string;
   contractCopyUserFileName?: string;
}

export interface AgencyUserInviteCreateDto extends AgencyUserInviteCreateApiDto {
  invitedByCorporateUserId: string;
  inviteStatus: AgencyUserInviteDbStatusEnum;
}

export interface AgencyUserInviteDbPhoneNumberDto {
   /**
    * @example 9666308100
    */
   number: number;

   /**
    * @example 91
    */
   countryCode: number;
}

export interface AgencyUserInviteUpdateApiDto {
  agencyInviteId: string;

  /**
   * @example "01K8X5828XCC0E5QKTJ1ED91KJ.pdf"
   */
  contractCopyAwsS3FileName: string;
}

export interface AgencyUserInviteCommonUpdateDto {
  /**
   * @example "01K8X5828XCC0E5QKTJ1ED91KJ.pdf"
   */
  contractCopyAwsS3FileName: string;

  /**
   * @reference "id" attribute of "CorporateUser.model.ts"
   */
  updatedByCorporateUserId: string;

  updatedAt: string;
}