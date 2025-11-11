
// Import dtos
import { AgencyUserDbPhoneNumberDto } from "../../dtos/AgencyUser.dto";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyUserDto extends BaseFirestoreModel {
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

export { DbAgencyUserDto };