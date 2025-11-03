
// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

class TestDao implements BaseDao {
  databaseName: string = "(default)";
  collectionName: string = "testCollection";
}

const testDaoObj = new TestDao();
export {
   testDaoObj,
   TestDao
}