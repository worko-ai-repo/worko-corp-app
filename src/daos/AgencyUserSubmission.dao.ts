
// Import firestore package
import { DocumentData, Firestore, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import models
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";

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
}

const agencyUserSubmissionDaoObj = new AgencyUserSubmissionDao();
export { agencyUserSubmissionDaoObj, AgencyUserSubmissionDao };