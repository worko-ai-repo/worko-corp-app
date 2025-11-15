import { BaseFirestoreModel } from "./Base.model";

interface DbAgencyUserSubmissionDto extends BaseFirestoreModel {
  /**
   * @description For a "job" belongs to particular "company"
   * the "candidate profile" will be submitted by particular "agency"
   */
  companyId: string;
  jobId: string;

  /**
   * @description Email of the candidate which was submitted by particular "agency"
   */
  candidateEmail: string;

  /**
   * @reference "id" field of "CandidateParsedCv.model.ts"
   */
  candidateParsedCvId: string;

  /**
   * @reference "id" field of "AgencyUser.model.ts"
   * @description The registered agency user who submitted the "candidate profile"
   */
  agencyUserId: string;

  /**
   * @reference "email" field of "AgencyUser.model.ts"
   * @description The registered agency user who submitted the "candidate profile"
   */
  agencyRegisteredEmail: string;

  /**
   * @reference "id" field of "AgencyUserInvite.model.ts"
   */
  agencyUserInviteId: string;
  
  /**
   * @reference "agencyName" field of "AgencyUserInvite.model.ts"
   */
  agencyName: string;

  /**
   * @reference "id" field of "AgencyJobAssignment.model.ts"
   */
  agencyJobAssignmentId: string;

  agencyComments: string;

  /**
   * @referenc "assignedByCorporateUserId" field of "AgencyJobAssignment.model.ts"
   */
  agencyJobAssignedByCorporateUserId?: string;

  /**
   * @reference "assignedByUserId" field of "AgencyJobAssignment.model.ts"
   */
  agencyJobAssignedByUserId?: string;

  /**
   * @reference "id" attribute of "UserDetail.model.ts" from "AWS Dynamodb"
   * @description 
   *  1. If the candidate is registered in "worko" job portal then "userDetailId" will be available
   */
  userDetailId?: string;
}

export { DbAgencyUserSubmissionDto };