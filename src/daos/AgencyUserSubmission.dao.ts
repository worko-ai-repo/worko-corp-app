// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

class AgencyUserSubmissionDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyUserSubmissions";
}

const agencyUserSubmissionDaoObj = new AgencyUserSubmissionDao();
export { agencyUserSubmissionDaoObj, AgencyUserSubmissionDao };