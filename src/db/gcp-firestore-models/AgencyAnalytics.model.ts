// Import models
import { BaseFirestoreModel } from "./Base.model";

/**
 * DbAgencyAnalyticsDto
 *
 * A Firestore aggregate document for unique company-agency-job combination.
 * Document id format: {companyId}_{agencyId}_{jobId}
 */
interface DbAgencyAnalyticsDto extends BaseFirestoreModel {
  /**
   * Company tenant identifier used for scoped analytics reads/writes.
   */
  companyId: string;

  /**
   * Company name for analytics display.
   */
  companyName?: string;

  /**
   * Agency identifier for which counters are maintained.
   */
  agencyId: string;

  /**
   * Denormalized agency name for lightweight reads.
   */
  agencyName: string;

  /**
   * Job identifier.
   */
  jobId: string;

  /**
   * Denormalized job title used in matrix responses.
   */
  jobTitle?: string;

  /**
   * Date when job was assigned to agency.
   */
  jobAssignedDate?: string;

  /**
   * Total number of candidate submissions tracked in this aggregate.
   */
  submittedCount: number;

  /**
   * Total candidates moved into in-process stages.
   */
  inProcessCount: number;

  /**
   * Total candidates marked as rejected.
   */
  rejectedCount: number;

  /**
   * Total candidates marked as hired.
   */
  hiredCount: number;

  /**
   * Total candidates accepted by recruiter/admin actions.
   */
  acceptedCount: number;

  /**
   * Total candidate events tracked for this aggregate.
   */
  totalCandidates: number;

  /**
   * Last event type that updated this document.
   */
  lastEventType: string;

  /**
   * Last event id processed for idempotency checks.
   */
  lastEventId: string;

  /**
   * Last activity timestamp for this aggregate document.
   */
  lastActivityAt: string;
}

export { DbAgencyAnalyticsDto };

