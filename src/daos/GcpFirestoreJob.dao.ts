// Import firestore package
import { Firestore } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import models
import { DbGcpFirestoreJobDto } from "../db/gcp-firestore-models/GcpFirestoreJob.model";

class GcpFirestoreJobDao implements BaseDao {
  databaseName: string = `worko-jobs-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "workoJobs";

  getGcpFirestoreJobModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getGcpFirestoreJobDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async getJobById(id: string): Promise<DbGcpFirestoreJobDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbGcpFirestoreJobDto>(
      this.getGcpFirestoreJobModelDetails(),
      id
    );
  }

  async getJobsByIds(ids: string[]): Promise<DbGcpFirestoreJobDto[]> {
    return gcpFirestoreLibrary.getAllDocumentsByIdsWithoutPagination<DbGcpFirestoreJobDto>(
      this.getGcpFirestoreJobModelDetails(),
      ids
    );
  }
}

const gcpFirestoreJobDaoObj: GcpFirestoreJobDao = new GcpFirestoreJobDao();
export { gcpFirestoreJobDaoObj, GcpFirestoreJobDao };
