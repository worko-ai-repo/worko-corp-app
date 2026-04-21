// Import firestore package
import { DocumentData, FieldPath, Firestore, Query } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { AgencyAnalyticsListingFilterOptions } from "../dtos/AgencyAnalytics.dto";
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import models
import { DbAgencyAnalyticsDto } from "../db/gcp-firestore-models/AgencyAnalytics.model";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

/**
 * AgencyAnalyticsDao
 *
 * Data access object for agency analytics aggregate documents.
 */
class AgencyAnalyticsDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyAnalytics";

  /**
   * getAgencyAnalyticsModelDetails
   *
   * Returns common firestore model details.
   */
  getAgencyAnalyticsModelDetails(): GcpFirestoreInteractionDto {
    global.logger.info("Getting agency analytics model details. [DAO]", {
      methodName: this.getAgencyAnalyticsModelDetails.name,
      fileName: __filename,
    });
    return {
      collectionName: this.collectionName,
      databaseName: this.databaseName,
    };
  }

  /**
   * getAgencyAnalyticsFirestoreDatabase
   *
   * Returns firestore database instance for analytics collection.
   */
  getAgencyAnalyticsFirestoreDatabase(): Promise<Firestore> {
    global.logger.info("Getting agency analytics firestore database. [DAO]", {
      databaseName: this.databaseName,
      methodName: this.getAgencyAnalyticsFirestoreDatabase.name,
      fileName: __filename,
    });
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  /**
   * createAgencyAnalytics
   *
   * Creates a new agency analytics aggregate document.
   */
  async createAgencyAnalytics(
    createData: DbAgencyAnalyticsDto,
  ): Promise<DbAgencyAnalyticsDto | undefined> {
    global.logger.info("Creating agency analytics document. [DAO]", {
      createData,
      methodName: this.createAgencyAnalytics.name,
      fileName: __filename,
    });
    return gcpFirestoreLibrary.createDocument<DbAgencyAnalyticsDto>(
      this.getAgencyAnalyticsModelDetails(),
      createData,
    );
  }

  /**
   * getAgencyAnalyticsById
   *
   * Fetches agency analytics aggregate by document id.
   */
  async getAgencyAnalyticsById(
    id: string,
  ): Promise<DbAgencyAnalyticsDto | undefined> {
    global.logger.info("Getting agency analytics by id. [DAO]", {
      id,
      methodName: this.getAgencyAnalyticsById.name,
      fileName: __filename,
    });
    return gcpFirestoreLibrary.getDocumentById<DbAgencyAnalyticsDto>(
      this.getAgencyAnalyticsModelDetails(),
      id,
    );
  }

  /**
   * updateAgencyAnalyticsById
   *
   * Updates an agency analytics aggregate document by id.
   */
  async updateAgencyAnalyticsById(
    id: string,
    updateData: Partial<DbAgencyAnalyticsDto>,
  ): Promise<DbAgencyAnalyticsDto | undefined> {
    global.logger.info("Updating agency analytics by id. [DAO]", {
      id,
      updateData,
      methodName: this.updateAgencyAnalyticsById.name,
      fileName: __filename,
    });
    return gcpFirestoreLibrary.updateDocumentById<
      Partial<DbAgencyAnalyticsDto>,
      DbAgencyAnalyticsDto
    >(this.getAgencyAnalyticsModelDetails(), id, updateData);
  }

  /**
   * getAgencyAnalyticsByFilterOptions
   *
   * Lists analytics records with company scope and optional filters.
   */
  async getAgencyAnalyticsByFilterOptions(
    filterOptions: AgencyAnalyticsListingFilterOptions,
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyAnalyticsDto[]>> {
    global.logger.info("Listing agency analytics by filter options. [DAO]", {
      filterOptions,
      methodName: this.getAgencyAnalyticsByFilterOptions.name,
      fileName: __filename,
    });
    const {
      agencyId,
      companyId,
      roleId,
      sortOrder,
    } = filterOptions;

    const db: Firestore = await this.getAgencyAnalyticsFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db
      .collection(this.collectionName)
      .where("companyId", "==", companyId);

    if (agencyId) {
      baseQuery = baseQuery.where("agencyId", "==", agencyId);
    }

    if (roleId) {
      baseQuery = baseQuery.where("roleId", "==", roleId);
    }

    if (sortOrder) {
      baseQuery = baseQuery.orderBy(FieldPath.documentId(), sortOrder);
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyAnalyticsListingFilterOptions,
      DbAgencyAnalyticsDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

const agencyAnalyticsDaoObj = new AgencyAnalyticsDao();
export { agencyAnalyticsDaoObj, AgencyAnalyticsDao };

