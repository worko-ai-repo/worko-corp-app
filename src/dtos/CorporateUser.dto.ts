
// Import Enums
import { CorporateUserTypeEnum } from "../enums/CorporateUser.enum";

/**
 * CorporateUserCreateApiDto
 *
 * This is the dto used for as the request body for the create corporate user Create Api.
 *
 * @enum {CorporateUserTypeEnum} role - The role of the corporate user
 */
export interface CorporateUserCreateApiDto {
  companyId: string;
  cognitoUserId: string; // This is the cognito id of the user
  email: string;
  inviteId: string;
  corporateUserType: CorporateUserTypeEnum;
  firstName: string;
  lastName: string;
  phoneNumberDetails: CorporateUserDbPhoneNumberDetailDto;
}

/**
 * CorporateUserCreateDto
 *
 * This is the dto used for as the request body for the create corporate user Create Api.This will be used By Backend
 *
 * @extends {CorporateUserCreateApiDto} - The role of the corporate user
 */
export interface CorporateUserCreateDto extends CorporateUserCreateApiDto {
  // Miscelaneous attributes
  isDeleted: boolean;
}

/**
 * CorporateUserUpdateApiDto
 *
 * This is the dto used for as the request body for the update corporate user Create Api.
 */
export interface CorporateUserUpdateApiDto {
  firstName?: string;
  lastName?: string;
}

/**
 * CorporateUserUpdateDto
 *
 * This is the dto used for as the request body for the update corporate user Create Api.This will be used By Backend
 */
export interface CorporateUserUpdateDto extends CorporateUserUpdateApiDto {
  // Keys
  email: string;
  companyId: string;

  updatedByUserId?: string;
  deletedByUserId?: string;

  updatedByCorporateUserId?: string;
  deletedByCorporateUserId?: string;
}


export interface CorporateUserDbPhoneNumberDetailDto {
  countryCode: string;
  phoneNumber: string;
}
