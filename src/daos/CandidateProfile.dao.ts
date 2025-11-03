// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

class CandidateProfileDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "candidateProfiles";
}

const candidateProfileDaoObj = new CandidateProfileDao();
export { candidateProfileDaoObj, CandidateProfileDao };