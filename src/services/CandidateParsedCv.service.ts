
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

  async getAllCandidateParsedCvsByIdsWithoutPagination(candidateParsedCvIds: string[]): Promise<DbCandidateParsedCvDto[]> {
    return candidateParsedCvDaoObj.getAllCandidateParsedCvsByIdsWithoutPagination(candidateParsedCvIds);
  }

  async getCandidateParsedCvDetailsMapByIds(candidateParsedCvIds: string[]): Promise<Map<string, DbCandidateParsedCvDto>> {
    const retrievedCandidateParsedCvDetails: DbCandidateParsedCvDto[] = await this.getAllCandidateParsedCvsByIdsWithoutPagination(candidateParsedCvIds);

    return new Map(
      retrievedCandidateParsedCvDetails.map((candidateParsedCv: DbCandidateParsedCvDto) => [candidateParsedCv.id, candidateParsedCv])
    );
  }
}

const candidateParsedCvServiceObj = new CandidateParsedCvService();
export { candidateParsedCvServiceObj, CandidateParsedCvService };