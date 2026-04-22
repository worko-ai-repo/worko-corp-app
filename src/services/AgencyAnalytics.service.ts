// Import firestore package
import { FieldValue } from "@google-cloud/firestore";

// Import daos
import { agencyAnalyticsDaoObj } from "../daos/AgencyAnalytics.dao";

// Import dtos
import {
  AgencyAnalyticsApplyEventDto,
  AgencyAnalyticsEventTypeEnum,
  AgencyAnalyticsListingFilterOptions,
  AgencyPerformanceMatrixItemDto,
} from "../dtos/AgencyAnalytics.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import enums
import { GcpFirestoreSortOrderTypeEnum } from "../enums/Common.gcp-firestore.enum";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyAnalyticsDto } from "../db/gcp-firestore-models/AgencyAnalytics.model";

/**
 * AgencyAnalyticsService
 *
 * Service for agency analytics aggregate updates and read APIs.
 */
class AgencyAnalyticsService {
  /**
   * buildAgencyAnalyticsDocId
   *
   * Creates deterministic Firestore document id for company-agency-role aggregate.
   */
  private buildAgencyAnalyticsDocId(
    companyId: string,
    agencyId: string,
    jobId: string,
  ): string {
    global.logger.info("Building agency analytics document id. [Service]", {
      companyId,
      agencyId,
      jobId,
      methodName: this.buildAgencyAnalyticsDocId.name,
      fileName: __filename,
    });
    return `${companyId}_${agencyId}_${jobId}`;
  }

  /**
   * getEventCounterDelta
   *
   * Returns increment fields based on incoming analytics event type.
   */
  private getEventCounterDelta(
    eventType: AgencyAnalyticsEventTypeEnum,
  ): Partial<DbAgencyAnalyticsDto> {
    global.logger.info("Calculating agency analytics counter delta. [Service]", {
      eventType,
      methodName: this.getEventCounterDelta.name,
      fileName: __filename,
    });
    switch (eventType) {
      case AgencyAnalyticsEventTypeEnum.CANDIDATE_SUBMITTED:
        return {
          submittedCount: FieldValue.increment(1) as unknown as number,
          totalCandidates: FieldValue.increment(1) as unknown as number,
        };
      case AgencyAnalyticsEventTypeEnum.CANDIDATE_IN_PROCESS:
        return {
          inProcessCount: FieldValue.increment(1) as unknown as number,
        };
      case AgencyAnalyticsEventTypeEnum.CANDIDATE_REJECTED:
        return {
          rejectedCount: FieldValue.increment(1) as unknown as number,
        };
      case AgencyAnalyticsEventTypeEnum.CANDIDATE_HIRED:
        return {
          hiredCount: FieldValue.increment(1) as unknown as number,
        };
      case AgencyAnalyticsEventTypeEnum.CANDIDATE_ACCEPTED:
        return {
          acceptedCount: FieldValue.increment(1) as unknown as number,
        };
      default:
        return {};
    }
  }

  /**
   * applyAgencyAnalyticsEvent
   *
   * Creates aggregate document on first event and increments counters on every next event.
   */
  async applyAgencyAnalyticsEvent(
    eventPayload: AgencyAnalyticsApplyEventDto,
  ): Promise<DbAgencyAnalyticsDto | undefined> {
    global.logger.info("Applying agency analytics event. [Service]", {
      eventPayload,
      methodName: this.applyAgencyAnalyticsEvent.name,
      fileName: __filename,
    });
    const {
      agencyId,
      agencyName,
      companyId,
      companyName,
      eventId,
      eventType,
      jobAssignedDate,
      jobId,
      jobTitle,
    } = eventPayload;
    const docId: string = this.buildAgencyAnalyticsDocId(
      companyId,
      agencyId,
      jobId,
    );
    const currentDate: string = dateHelperObj.getISODate();
    const existingAnalytics: DbAgencyAnalyticsDto | undefined =
      await agencyAnalyticsDaoObj.getAgencyAnalyticsById(docId);

    if (!existingAnalytics) {
      const initialData: DbAgencyAnalyticsDto = {
        acceptedCount: 0,
        agencyId,
        agencyName,
        companyId,
        companyName,
        createdAt: currentDate,
        hiredCount: 0,
        id: docId,
        inProcessCount: 0,
        jobAssignedDate,
        jobId,
        jobTitle,
        lastActivityAt: currentDate,
        lastEventId: eventId,
        lastEventType: eventType,
        rejectedCount: 0,
        submittedCount: 0,
        totalCandidates: 0,
        updatedAt: currentDate,
      };

      const createData: DbAgencyAnalyticsDto = {
        ...initialData,
        ...(this.getEventCounterDelta(eventType) as unknown as Partial<DbAgencyAnalyticsDto>),
      };
      return agencyAnalyticsDaoObj.createAgencyAnalytics(createData);
    }

    if (existingAnalytics.lastEventId === eventId) {
      return existingAnalytics;
    }

    return agencyAnalyticsDaoObj.updateAgencyAnalyticsById(docId, {
      ...this.getEventCounterDelta(eventType),
      agencyName,
      companyName,
      jobAssignedDate: jobAssignedDate ?? existingAnalytics.jobAssignedDate,
      jobTitle: jobTitle ?? existingAnalytics.jobTitle,
      lastActivityAt: currentDate,
      lastEventId: eventId,
      lastEventType: eventType,
      updatedAt: currentDate,
    });
  }

  /**
   * getAgencyPerformanceMatrix
   *
   * Returns role-wise matrix data for agency analytics.
   */
  async getAgencyPerformanceMatrix(
    filterOptions: AgencyAnalyticsListingFilterOptions,
  ): Promise<GcpFirestoreRecordListingResponseDTO<AgencyPerformanceMatrixItemDto[]>> {
    global.logger.info("Getting agency performance matrix. [Service]", {
      filterOptions,
      methodName: this.getAgencyPerformanceMatrix.name,
      fileName: __filename,
    });
    const response =
      await agencyAnalyticsDaoObj.getAgencyAnalyticsByFilterOptions({
        ...filterOptions,
        sortOrder:
          filterOptions.sortOrder ?? GcpFirestoreSortOrderTypeEnum.DESCENDING,
      });

    return {
      data: response.data.map((item: DbAgencyAnalyticsDto) => ({
        acceptedCount: item.acceptedCount ?? 0,
        agencyId: item.agencyId,
        agencyName: item.agencyName,
        companyName: item.companyName,
        hiredCount: item.hiredCount ?? 0,
        inProcessCount: item.inProcessCount ?? 0,
        jobAssignedDate: item.jobAssignedDate,
        jobId: item.jobId ?? (item as any).roleId,
        jobTitle: item.jobTitle ?? (item as any).roleTitle,
        lastActivityAt: item.lastActivityAt ?? item.updatedAt,
        rejectedCount: item.rejectedCount ?? 0,
        submittedCount: item.submittedCount ?? 0,
        totalCandidates: item.totalCandidates ?? 0,
      })),
      pagination: response.pagination,
    };
  }

  /**
   * getAgencyPerformanceSummary
   *
   * Returns top-level totals for company scoped agency analytics.
   */
  async getAgencyPerformanceSummary(
    filterOptions: AgencyAnalyticsListingFilterOptions,
  ): Promise<{
    totalAcceptedCount: number;
    totalAgencies: number;
    totalHiredCount: number;
    totalInProcessCount: number;
    totalJobs: number;
    totalRejectedCount: number;
    totalSubmittedCount: number;
  }> {
    global.logger.info("Getting agency performance summary. [Service]", {
      filterOptions,
      methodName: this.getAgencyPerformanceSummary.name,
      fileName: __filename,
    });
    const response =
      await agencyAnalyticsDaoObj.getAgencyAnalyticsByFilterOptions({
        ...filterOptions,
        pageSize: 500,
        sortOrder: GcpFirestoreSortOrderTypeEnum.DESCENDING,
      });

    const agencies: Set<string> = new Set<string>();
    const jobs: Set<string> = new Set<string>();

    const totals = response.data.reduce(
      (accumulator, item: DbAgencyAnalyticsDto) => {
        agencies.add(item.agencyId);
        jobs.add(item.jobId ?? (item as any).roleId);
        accumulator.totalAcceptedCount += item.acceptedCount ?? 0;
        accumulator.totalHiredCount += item.hiredCount ?? 0;
        accumulator.totalInProcessCount += item.inProcessCount ?? 0;
        accumulator.totalRejectedCount += item.rejectedCount ?? 0;
        accumulator.totalSubmittedCount += item.submittedCount ?? 0;
        return accumulator;
      },
      {
        totalAcceptedCount: 0,
        totalHiredCount: 0,
        totalInProcessCount: 0,
        totalRejectedCount: 0,
        totalSubmittedCount: 0,
      },
    );

    return {
      ...totals,
      totalAgencies: agencies.size,
      totalJobs: jobs.size,
    };
  }
}

const agencyAnalyticsServiceObj = new AgencyAnalyticsService();
export { agencyAnalyticsServiceObj, AgencyAnalyticsService };

