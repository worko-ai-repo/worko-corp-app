
// Import dtos
import { AgencyBulkJdResumeDbCvExtractedParsedDto } from "../../dtos/AgencyBulkJdResume.dto";

// Import enums
import { AgencyBulkJdResumeProcessingStatusEnum } from "../../enums/AgencyBulkJdResume.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

/**
 * DbAgencyBulkJdResumeDto
 *
 * Firestore document structure for Agency Bulk JD Resume
 */
export interface DbAgencyBulkJdResumeDto extends BaseFirestoreModel {
  // References
  /**
   * @reference "id" field of "AgencyBulkJd.model.ts"
   */
  agencyBulkJdId: string;
  companyId?: string;
  /**
   * @reference "id" field of "AgencyUser.model.ts""
   */
  createdByAgencyUserId: string;
  updatedByAgencyUserId?: string;

  agencyRegisteredEmail: string;

  // File details
  userFileName: string;
  cloudFileName: string;
  processingStatus: AgencyBulkJdResumeProcessingStatusEnum;

  // CV analysis results (populated by Lambda)
  cvExtractedParsed?: AgencyBulkJdResumeDbCvExtractedParsedDto;
  cvExtract?: string;
  matchingScore?: number;
  jdMatchErrorCode?: number;
  jdMatchErrorDesc?: string;
  scoreDetails?: string;
  scoreFetchedDate?: string;
  rejectionFeedbackBySystem?: string;
}
