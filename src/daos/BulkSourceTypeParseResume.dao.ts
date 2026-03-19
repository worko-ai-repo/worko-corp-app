// Import firestore package
import { Firestore } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import models
import { DbBulkSourceTypeParseResumeDto } from "../db/gcp-firestore-models/BulkSourceTypeParseResume.model";

class BulkSourceTypeParseResumeDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "bulkSourceTypeParseResumes";

  getBulkSourceTypeParseResumeModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getBulkSourceTypeParseResumeFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

   async bulkCreateBulkSourceTypeParseResume(requestBody: DbBulkSourceTypeParseResumeDto[]) {
      return gcpFirestoreLibrary.bulkCreateDocumentWithoutLimit<DbBulkSourceTypeParseResumeDto>(this.getBulkSourceTypeParseResumeModelDetails(), requestBody);
   }
}

const bulkSourceTypeParseResumeDaoObj = new BulkSourceTypeParseResumeDao();
export { bulkSourceTypeParseResumeDaoObj, BulkSourceTypeParseResumeDao };