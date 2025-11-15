
import { BaseFirestoreModel } from "./Base.model";

// Import enums
import { AgencyJobAssignmentDbStatusEnum } from "../../enums/AgencyJobAssignment.enum";

interface DbAgencyJobAssignmentDto extends BaseFirestoreModel {
  /**
   * @reference "id" attribute of "CompanyDetail.model.ts" from "AWS DynamoDB"
   */
  companyId: string;

  /**
   * @reference "id" attribute of "OpensearchJob.model.ts" from  from "AWS Opensearch"
   */
  jobId: string;

  /**
   * @reference "id" attribute of "CorporateUser.model.ts" from "AWS DynamoDB"
   */
  assignedByCorporateUserId?: string;

  /**
   * @referenc "id" attribute of "UserDetail.model.ts" from "AWS DynamoDB"
   */
  assignedByUserId?: string;

  /**
   * @reference "email" attribute of "AgencyUser.model.ts"  from "GCP Firestore"
   */
  agencyRegisteredEmail: string;

  /**
   * @reference "id" attribute of "AgencyUserInvite.model.ts" from "GCP Firestore""
   */
  agencyUserInviteId: string;

  status: AgencyJobAssignmentDbStatusEnum;
}

export { DbAgencyJobAssignmentDto };