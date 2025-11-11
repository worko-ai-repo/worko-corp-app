
// Import dtos
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

// Import enums
import { AgencyJobAssignmentDbStatusEnum } from "../enums/AgencyJobAssignment.enum";

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


export interface AgencyJobAssignmentListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
  status?: AgencyJobAssignmentDbStatusEnum;

  /**
   * @reference "email" field of "AgencyUser.model.ts"
   */
  agencyRegisteredEmail?: string;

  companyId?: string;

  includeJobDetails?: boolean;
}


export interface AgencyJobAssignmentListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
  status?: AgencyJobAssignmentDbStatusEnum;

  /**
   * @description The email of the person who is being invited
   */
  agencyRegisteredEmail?: string;

  companyId?: string;

  includeJobDetails?: boolean;
}