
// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

class CandidateParsedCvDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "candidateParsedCvs";

  getCandidateParsedCvModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getCandidateParsedCvFirestoreDatabase() {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createCandidateParsedCv(createData: DbCandidateParsedCvDto) {
    global.logger.info(`Create Candidate Parsed CV [DAO]`, {
      methodName: this.createCandidateParsedCv.name,
    });

    return gcpFirestoreLibrary.createDocument<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      createData
    );
  }
}

const candidateParsedCvDaoObj = new CandidateParsedCvDao();
export { candidateParsedCvDaoObj, CandidateParsedCvDao };