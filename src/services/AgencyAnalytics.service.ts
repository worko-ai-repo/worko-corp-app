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
  AgencyRankingItemDto,
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
    roleId: string,
  ): string {
    global.logger.info("Building agency analytics document id. [Service]", {
      companyId,
      agencyId,
      roleId,
      methodName: this.buildAgencyAnalyticsDocId.name,
      fileName: __filename,
    });
    return `${companyId}_${agencyId}_${roleId}`;
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
      eventId,
      eventType,
      roleId,
      roleTitle,
    } = eventPayload;
    const docId: string = this.buildAgencyAnalyticsDocId(
      companyId,
      agencyId,
      roleId,
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
        createdAt: currentDate,
        hiredCount: 0,
        id: docId,
        inProcessCount: 0,
        lastActivityAt: currentDate,
        lastEventId: eventId,
        lastEventType: eventType,
        rejectedCount: 0,
        roleId,
        roleTitle,
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
      lastActivityAt: currentDate,
      lastEventId: eventId,
      lastEventType: eventType,
      roleTitle: roleTitle ?? existingAnalytics.roleTitle,
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
        hiredCount: item.hiredCount ?? 0,
        inProcessCount: item.inProcessCount ?? 0,
        lastActivityAt: item.lastActivityAt ?? item.updatedAt,
        rejectedCount: item.rejectedCount ?? 0,
        roleId: item.roleId,
        roleTitle: item.roleTitle,
        submittedCount: item.submittedCount ?? 0,
        totalCandidates: item.totalCandidates ?? 0,
      })),
      pagination: response.pagination,
    };
  }

  /**
   * getAgencyRanking
   *
   * Aggregates role docs by agency and calculates ranking buckets.
   */
  async getAgencyRanking(
    filterOptions: AgencyAnalyticsListingFilterOptions,
  ): Promise<GcpFirestoreRecordListingResponseDTO<AgencyRankingItemDto[]>> {
    global.logger.info("Getting agency ranking. [Service]", {
      filterOptions,
      methodName: this.getAgencyRanking.name,
      fileName: __filename,
    });
    const response =
      await agencyAnalyticsDaoObj.getAgencyAnalyticsByFilterOptions({
        ...filterOptions,
        pageSize: 100,
        sortOrder: GcpFirestoreSortOrderTypeEnum.DESCENDING,
      });

    const rankingMap: Record<
      string,
      {
        acceptedCount: number;
        agencyId: string;
        agencyName: string;
        hiredCount: number;
        inProcessCount: number;
      }
    > = {};

    response.data.forEach((item: DbAgencyAnalyticsDto) => {
      if (!rankingMap[item.agencyId]) {
        rankingMap[item.agencyId] = {
          acceptedCount: 0,
          agencyId: item.agencyId,
          agencyName: item.agencyName,
          hiredCount: 0,
          inProcessCount: 0,
        };
      }

      rankingMap[item.agencyId].acceptedCount += item.acceptedCount ?? 0;
      rankingMap[item.agencyId].hiredCount += item.hiredCount ?? 0;
      rankingMap[item.agencyId].inProcessCount += item.inProcessCount ?? 0;
    });

    const rankedData: AgencyRankingItemDto[] = Object.values(rankingMap)
      .map((item) => {
        const score: number =
          item.acceptedCount * 0.3 +
          item.inProcessCount * 0.2 +
          item.hiredCount * 0.5;

        let rankBucket: AgencyRankingItemDto["rankBucket"] = "POOR";
        if (score >= 75) {
          rankBucket = "TOP_PERFORMER";
        } else if (score >= 45) {
          rankBucket = "MEDIUM";
        } else if (score >= 20) {
          rankBucket = "LOW";
        }

        return {
          ...item,
          rankBucket,
          rankPosition: 0,
          score: Number(score.toFixed(2)),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({
        ...item,
        rankPosition: index + 1,
      }));

    return {
      data: rankedData,
      pagination: {
        count: rankedData.length,
        pageSize: rankedData.length,
      },
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
    totalRejectedCount: number;
    totalRoles: number;
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
    const roles: Set<string> = new Set<string>();

    const totals = response.data.reduce(
      (accumulator, item: DbAgencyAnalyticsDto) => {
        agencies.add(item.agencyId);
        roles.add(item.roleId);
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
      totalRoles: roles.size,
    };
  }
}

const agencyAnalyticsServiceObj = new AgencyAnalyticsService();
export { agencyAnalyticsServiceObj, AgencyAnalyticsService };

