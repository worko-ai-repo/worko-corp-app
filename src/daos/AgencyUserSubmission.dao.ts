
// Import firestore package
import { DocumentData, FieldPath, Firestore, Query, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { AgencyUserSubmissionListingFilterOptions } from "../dtos/AgencyUserSubmission.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import models
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class AgencyUserSubmissionDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyUserSubmissions";

  getAgencyUserSubmissionFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  getAgencyUserSubmissionModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  async createAgencyUserSubmission(
    createData: DbAgencyUserSubmissionDto
  ): Promise<DbAgencyUserSubmissionDto | undefined> {
    global.logger.info(`Create Agency User Submission [DAO]`, {
      methodName: this.createAgencyUserSubmission.name,
    });

    return gcpFirestoreLibrary.createDocument<DbAgencyUserSubmissionDto>(
      this.getAgencyUserSubmissionModelDetails(),
      createData
    );
  }

  async getAllAgencyUserSubmissionByFilterOptions(filterOptions: AgencyUserSubmissionListingFilterOptions): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyUserSubmissionDto[]>> {
    global.logger.info(`Get All Agency User Submission [DAO]`, {
      methodName: this.getAllAgencyUserSubmissionByFilterOptions.name,
    });

    const { 
      companyId, jobId, agencyRegisteredEmail, 
      agencyName, agencyJobAssignedByCorporateUserId,
      sortOrder, searchText
    } =
      filterOptions;

    const db: Firestore = await this.getAgencyUserSubmissionFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    );

    if(
      !companyId &&
      !jobId &&
      !agencyRegisteredEmail &&
      !agencyName &&
      !agencyJobAssignedByCorporateUserId &&
      !searchText
    ) {
      baseQuery = baseQuery.orderBy("createdAt", sortOrder)
    } else {
      if (companyId) baseQuery = baseQuery.where("companyId", "==", companyId);
      if (jobId)
        baseQuery = baseQuery.where(
          "jobId",
          "==",
          jobId
        );
      if (agencyRegisteredEmail)
        baseQuery = baseQuery.where("agencyRegisteredEmail", "==", agencyRegisteredEmail);
      if (searchText) {
        if(
          searchText?.includes("@")
        ) {
          baseQuery = baseQuery.where("candidateEmail", "==", searchText.toLowerCase());
        } else {
          baseQuery = baseQuery.where("candidateName", "==", searchText.toLowerCase());
        }
      }
      if (agencyName) baseQuery = baseQuery.where("agencyName", "==", filterOptions.agencyName);
      if (agencyJobAssignedByCorporateUserId) baseQuery = baseQuery.where("agencyJobAssignedByCorporateUserId", "==", agencyJobAssignedByCorporateUserId);

      if(sortOrder) baseQuery = baseQuery.orderBy(FieldPath.documentId(), sortOrder);
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyUserSubmissionListingFilterOptions,
      DbAgencyUserSubmissionDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }

  async getAgencyUserSubmissionById(id: string): Promise<DbAgencyUserSubmissionDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbAgencyUserSubmissionDto>(this.getAgencyUserSubmissionModelDetails(), id);
  }

  async updateAgencyUserSubmissionById(id: string, updateData: Partial<DbAgencyUserSubmissionDto>): Promise<DbAgencyUserSubmissionDto | undefined> {
    return gcpFirestoreLibrary.updateDocumentById<Partial<DbAgencyUserSubmissionDto>,DbAgencyUserSubmissionDto>(this.getAgencyUserSubmissionModelDetails(), id, updateData);
  }

  async updateBulkAgencyUserSubmissionByIds(ids: string[], updateData: Partial<DbAgencyUserSubmissionDto>): Promise<boolean> {
    return gcpFirestoreLibrary.bulkUpdateDocumentByIds<Partial<DbAgencyUserSubmissionDto>>(this.getAgencyUserSubmissionModelDetails(), ids, updateData);
  }
}

const agencyUserSubmissionDaoObj = new AgencyUserSubmissionDao();
export { agencyUserSubmissionDaoObj, AgencyUserSubmissionDao };