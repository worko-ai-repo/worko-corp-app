// Import firestore package
import { DocumentData, Firestore, Query, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { AgencyJobAssignmentListingFilterOptions } from "../dtos/AgencyJobAssignment.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import models
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class AgencyJobAssignmentDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyJobAssignments";

  getAgencyJobAssignmentModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyJobAssignmentFirestoreDatabase(): Firestore {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createBulkAgencyJobAssignment(
    documents: DbAgencyJobAssignmentDto[]
  ): Promise<boolean> {
    global.logger.info(`Create Bulk Agency Job Assignment [DAO]`, {
      methodName: this.createBulkAgencyJobAssignment.name,
    });

    return gcpFirestoreLibrary.bulkCreateDocument<DbAgencyJobAssignmentDto>(
      this.getAgencyJobAssignmentModelDetails(),
      documents
    );
  }

  async getBulkAgencyAssignment(
    companyId: string,
    agencyRegisteredEmail: string,
    jobIds: string[]
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info(`Check Existing Assignments [DAO]`, {
      methodName: this.getBulkAgencyAssignment.name,
    });

    const db: Firestore = this.getAgencyJobAssignmentFirestoreDatabase();

    return db
      .collection(this.collectionName)
      .where("companyId", "==", companyId)
      .where("agencyRegisteredEmail", "==", agencyRegisteredEmail)
      .where("jobId", "in", jobIds)
      .get();
  }

  async getAllAgencyJobAssignmentsByFilterOptions(
    filterOptions: AgencyJobAssignmentListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyJobAssignmentDto[]>> {
    global.logger.info(
      `Get All Agency Job Assignments By Filter Options [DAO]`,
      {
        methodName: this.getAllAgencyJobAssignmentsByFilterOptions.name,
      }
    );

    const { status, agencyRegisteredEmail, companyId } = filterOptions;

    const db: Firestore = this.getAgencyJobAssignmentFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    );

    if (status) baseQuery = baseQuery.where("status", "==", status);
    if (agencyRegisteredEmail)
      baseQuery = baseQuery.where(
        "agencyRegisteredEmail",
        "==",
        agencyRegisteredEmail
      );
    if (companyId) baseQuery = baseQuery.where("companyId", "==", companyId);

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyJobAssignmentListingFilterOptions,
      DbAgencyJobAssignmentDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }

  async getAgencyJobAssignmentByCompIdJobIdAndEmail(
    companyId: string,
    jobId: string,
    agencyRegisteredEmail: string
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info(
      `Get Agency Job Assignment By Comp Id Job Id And Email [DAO]`,
      {
        methodName: this.getAgencyJobAssignmentByCompIdJobIdAndEmail.name,
        companyId,
        jobId,
        agencyRegisteredEmail,
      }
    );

    const db: Firestore = this.getAgencyJobAssignmentFirestoreDatabase();

    return db
      .collection(this.collectionName)
      .where("companyId", "==", companyId)
      .where("jobId", "==", jobId)
      .where("agencyRegisteredEmail", "==", agencyRegisteredEmail)
      .get();
  }
}

const agencyJobAssignmentDaoObj = new AgencyJobAssignmentDao();
export { agencyJobAssignmentDaoObj, AgencyJobAssignmentDao };