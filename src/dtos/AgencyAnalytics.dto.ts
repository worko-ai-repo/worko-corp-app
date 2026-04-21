// Import DTOs
import {
  GcpFirestoreRecordListingFilterOptions,
  GcpFirestoreRecordListingFilterRequestDTO,
} from "./Common.gcp-firestore.dto";

/**
 * AgencyAnalyticsEventTypeEnum
 *
 * Supported event types to update aggregate counters.
 */
export enum AgencyAnalyticsEventTypeEnum {
  CANDIDATE_ACCEPTED = "CANDIDATE_ACCEPTED",
  CANDIDATE_HIRED = "CANDIDATE_HIRED",
  CANDIDATE_IN_PROCESS = "CANDIDATE_IN_PROCESS",
  CANDIDATE_REJECTED = "CANDIDATE_REJECTED",
  CANDIDATE_SUBMITTED = "CANDIDATE_SUBMITTED",
}

/**
 * AgencyAnalyticsApplyEventDto
 *
 * Event payload used by service to create/update a company-agency-role aggregate.
 */
export interface AgencyAnalyticsApplyEventDto {
  agencyId: string;
  agencyName: string;
  companyId: string;
  eventId: string;
  eventType: AgencyAnalyticsEventTypeEnum;
  roleId: string;
  roleTitle?: string;
}

/**
 * AgencyAnalyticsListingFilterOptions
 *
 * Filter options used by service and dao for listing analytics documents.
 */
export interface AgencyAnalyticsListingFilterOptions
  extends GcpFirestoreRecordListingFilterOptions {
  agencyId?: string;
  companyId: string;
  roleId?: string;
}

/**
 * AgencyAnalyticsListingFilterRequestDTO
 *
 * Request payload for listing analytics documents.
 */
export interface AgencyAnalyticsListingFilterRequestDTO
  extends GcpFirestoreRecordListingFilterRequestDTO {
  agencyId?: string;
  companyId: string;
  roleId?: string;
}

/**
 * AgencyPerformanceMatrixItemDto
 *
 * Matrix row representation per company-agency-role aggregate.
 */
export interface AgencyPerformanceMatrixItemDto {
  acceptedCount: number;
  agencyId: string;
  agencyName: string;
  hiredCount: number;
  inProcessCount: number;
  lastActivityAt: string;
  rejectedCount: number;
  roleId: string;
  roleTitle?: string;
  submittedCount: number;
  totalCandidates: number;
}

/**
 * AgencyRankingItemDto
 *
 * Ranking item representation.
 */
export interface AgencyRankingItemDto {
  acceptedCount: number;
  agencyId: string;
  agencyName: string;
  hiredCount: number;
  inProcessCount: number;
  rankBucket: "TOP_PERFORMER" | "MEDIUM" | "LOW" | "POOR";
  rankPosition: number;
  score: number;
}

