// Import enums
import { BulkSourceTypeResumeProcessingStatusEnum } from "../../enums/BulkSourceTypeResume.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbBulkSourceTypeResumeDto extends BaseFirestoreModel {
  createdByUserId?: string;
  createdByCorporateUserId?: string;
  totalResumesUploaded: number;
  totalResumesSucceeded: number;
  totalResumesFailed: number;
  totalResumesDuplicate: number;
  totalResumesProcessed: number;
  processingStatus: BulkSourceTypeResumeProcessingStatusEnum;
}

export { DbBulkSourceTypeResumeDto };
