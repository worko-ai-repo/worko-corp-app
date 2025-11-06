
export interface AgencyJobAssignmentBulkCreateApiDto {
  /**
   * @reference "id" of "CompanyDetail.model.ts"
   */
  companyId: string;

  /**
   * @reference "id" of "OpenSearchJob.model.ts"
   * @description list of job ids
   */
  jobsToAssign: string[];

  agencyEmail: string;

  /**
   * @reference "id" of "AgencyUserInvite.model.ts"
   */
  agencyInviteId: string;
}