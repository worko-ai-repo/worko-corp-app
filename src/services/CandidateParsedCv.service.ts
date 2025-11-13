
// Import daos
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

class CandidateParsedCvService {
  async createCandidateParsedCv(createData: DbCandidateParsedCvDto): Promise<DbCandidateParsedCvDto | undefined> {
    global.logger.info(`Create Candidate Parsed CV [Service]`, {
      methodName: this.createCandidateParsedCv.name,
    });

    return candidateParsedCvDaoObj.createCandidateParsedCv(createData);
  }
}

const candidateParsedCvServiceObj = new CandidateParsedCvService();
export { candidateParsedCvServiceObj, CandidateParsedCvService };