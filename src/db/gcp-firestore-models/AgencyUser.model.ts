import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyUserDto extends BaseFirestoreModel {
  cognitoUserId: string;
  email: string;
  name: string;
  phoneNumberDetails: object;
  inviteIds: string[];
}

export { DbAgencyUserDto };