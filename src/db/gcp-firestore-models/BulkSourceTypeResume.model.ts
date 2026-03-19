// Import enums
import { BulkSourceTypeResumeProcessingStatusEnum } from "../../enums/BulkSourceTypeResume.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbBulkSourceTypeResumeDto extends BaseFirestoreModel {
  createdByUserId?: string;
  createdByCorporateUserId?: string;

  /**
   * @description
   *  1. Count of only valid files uploaded like with proper file extension, size and name
   */
  totalResumesUploaded: number; 

  totalResumesSucceeded: number;
  totalResumesFailed: number;
  totalResumesDuplicate: number;
  totalResumesProcessed: number;
  totalLargeResumesUploaded?: number;
  totalInvalidFileNamesUploaded?: number; 
  processingStatus: BulkSourceTypeResumeProcessingStatusEnum;
}

export { DbBulkSourceTypeResumeDto };
