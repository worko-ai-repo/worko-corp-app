
export enum AgencyBulkJdProcessingStatusEnum {
  /**
   * @description Whenever Agency Bulk Job Description is created then it will be in "PROCESSING" status
   */
  PROCESSING = "PROCESSING",

  /**
   * @description In `AGENCY_BULK_JD_RESUME_POST_MATCHING_SCORE` event in `app-event-trigger.ts` if totalResumesProcessed and resumesCount is equal then it will be in "COMPLETED" status
   */
  COMPLETED = "COMPLETED",
}