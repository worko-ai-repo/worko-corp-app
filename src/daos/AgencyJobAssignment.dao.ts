// Import firestore package
import { DocumentData, Firestore, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import models
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";

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

    return gcpFirestoreLibrary.bulkCreateDocument<DbAgencyJobAssignmentDto>(this.getAgencyJobAssignmentModelDetails(), documents);
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
}

const agencyJobAssignmentDaoObj = new AgencyJobAssignmentDao();
export { agencyJobAssignmentDaoObj, AgencyJobAssignmentDao };