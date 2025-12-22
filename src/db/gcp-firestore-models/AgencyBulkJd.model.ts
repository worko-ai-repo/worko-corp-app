// import dtos
import { MinMaxRange } from "../../dtos/Common.dto";

// import models
import { BaseFirestoreModel } from "./Base.model";

/**
 * DbAgencyBulkJdDto
 *
 * Firestore document structure for Agency Bulk Job Description
 */
export interface DbAgencyBulkJdDto extends BaseFirestoreModel {
  /**
   * @reference "id" field of "AgencyUser.model.ts""
   */
  createdByAgencyUserId: string;
  updatedByAgencyUserId?: string;

  agencyRegisteredEmail: string;

  // Job details
  companyId?: string;
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
  resumesCount: number;
}
