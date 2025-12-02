
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
   * @reference "jobTitle" attribute of "OpensearchJob.model.ts" from "AWS Opensearch"
   * @note This should be stored in lowercase
   */
  jobTitle: string;

  /**
   * @reference "email" attribute of "AgencyUser.model.ts"  from "GCP Firestore"
   */
  agencyRegisteredEmail: string;

  /**
   * @reference "id" attribute of "AgencyUserInvite.model.ts" from "GCP Firestore""
   */
  agencyUserInviteId: string;

  status: AgencyJobAssignmentDbStatusEnum;

  /**
   * @reference "id" attribute of "CorporateUser.model.ts" from "AWS DynamoDB"
   */
  assignedByCorporateUserId?: string;

  /**
   * @reference "id" attribute of "UserDetail.model.ts" from "AWS DynamoDB"
   */
  assignedByUserId?: string;

  /**
   * @description
   *  1. Number of candidates uploaded or submitted by the agency for this particular job.
   */
  totalCandidatesUploaded?: number;

  /**
   * @reference "id" attribute of "AgencyUserSubmission.model.ts" from "GCP Firestore"
   */
  agencyUserSubmissionIds?: string[];

  updatedByCorporateUserId?: string;
}

export { DbAgencyJobAssignmentDto };