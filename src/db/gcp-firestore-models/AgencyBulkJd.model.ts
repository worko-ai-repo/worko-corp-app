
// import google cloud firestore
import { FieldValue } from "@google-cloud/firestore";

// import dtos
import { MinMaxRange } from "../../dtos/Common.dto";

// import enums
import { AgencyBulkJdProcessingStatusEnum } from "../../enums/AgencyBulkJd.enum";

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

  /**
   * @description Total number of resumes for which processing is finished (success or failure)
   */
  totalResumesProcessed?: number | FieldValue;

  /**
   * @description Total number of resumes for which a matching score was successfully generated
   */
  totalResumesSucceeded?: number | FieldValue;

  /**
   * @description Total number of resumes for which a matching score was not successfully generated
   */
  totalResumesFailed?: number | FieldValue;

  processingStatus?: AgencyBulkJdProcessingStatusEnum;
}
