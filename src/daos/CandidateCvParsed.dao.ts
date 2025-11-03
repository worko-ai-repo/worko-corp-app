// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

class CandidateCvParsedDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "candidateCvParsed";
}

const candidateCvParsedDaoObj = new CandidateCvParsedDao();
export { candidateCvParsedDaoObj, CandidateCvParsedDao };