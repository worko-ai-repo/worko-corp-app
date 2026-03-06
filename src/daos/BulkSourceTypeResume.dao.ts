// Import firestore package
import { Firestore } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import models
import { DbBulkSourceTypeResumeDto } from "../db/gcp-firestore-models/BulkSourceTypeResume.model";

class BulkSourceTypeResumeDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "bulkSourceTypeResumes";

  getBulkSourceTypeResumeModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getBulkSourceTypeResumeFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createBulkSourceTypeResume(
    createData: DbBulkSourceTypeResumeDto,
  ): Promise<DbBulkSourceTypeResumeDto | undefined> {
    return gcpFirestoreLibrary.createDocument<DbBulkSourceTypeResumeDto>(
      this.getBulkSourceTypeResumeModelDetails(),
      createData,
    );
  }

  async getBulkSourceTypeResumeById(id: string): Promise<DbBulkSourceTypeResumeDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbBulkSourceTypeResumeDto>(this.getBulkSourceTypeResumeModelDetails(), id);
  }
}

const bulkSourceTypeResumeDaoObj = new BulkSourceTypeResumeDao();
export { bulkSourceTypeResumeDaoObj, BulkSourceTypeResumeDao };