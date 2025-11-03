// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

class AgencyJobAssignmentDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyJobAssignments";
}

const agencyJobAssignmentDaoObj = new AgencyJobAssignmentDao();
export { agencyJobAssignmentDaoObj, AgencyJobAssignmentDao };