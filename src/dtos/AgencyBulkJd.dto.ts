// import dtos
import {
  MinMaxRange
} from "./Common.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

/**
 * AgencyBulkJdCreateApiDto
 *
 * This dto comes from the request api
 */
export interface AgencyBulkJdCreateApiDto {
  /**
   * @description
   *  1. Whenever `agency` selects a job from dropdown then this field is required
   *  2. If `agency` paste jd then this field is not required
   */
  companyId?: string;

  resumesCount: number;

  jobDescription: string;
  jobTitle: string;
  jobLocation?: string;
  mustHaveSkills?: string[];
  mustNotHaveSkills?: string[];
  goodToHaveSkills?: string[];
  coreSkills?: string[];
  softSkills?: string[];
  technicalSkills?: string[];
  industryPreferences?: string[];
  experienceRange?: MinMaxRange;
}

/**
 * AgencyBulkJdCreateDto
 *
 * This is an internal dto for backend logic
 */
export interface AgencyBulkJdCreateDto extends AgencyBulkJdCreateApiDto {
  createdByAgencyUserId: string;
  agencyRegisteredEmail: string;
}

export interface AgencyBulkJdFilterOptions extends GcpFirestoreRecordListingFilterOptions {
  companyId?: string;
}

export interface AgencyBulkJdFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
  companyId?: string;
}
