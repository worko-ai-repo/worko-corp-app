
// Import firestore package
import { DocumentData, Firestore, Query, QuerySnapshot } from "@google-cloud/firestore";

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

  getAgencyUserSubmissionFirestoreDatabase() {
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

    const { companyId, jobId, agencyRegisteredEmail, candidateEmail } =
      filterOptions;

    const db: Firestore = this.getAgencyUserSubmissionFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    );

    // If no filter options are provided, order by createdAt in specific order
    if(!companyId && !jobId && !agencyRegisteredEmail && !candidateEmail) {
      baseQuery = baseQuery.orderBy("createdAt", filterOptions.sortOrder);
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
      if (candidateEmail) baseQuery = baseQuery.where("candidateEmail", "==", candidateEmail);
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyUserSubmissionListingFilterOptions,
      DbAgencyUserSubmissionDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

const agencyUserSubmissionDaoObj = new AgencyUserSubmissionDao();
export { agencyUserSubmissionDaoObj, AgencyUserSubmissionDao };