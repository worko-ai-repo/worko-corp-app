

// Import daos
import { bulkSourceTypeParseResumeDaoObj } from "../daos/BulkSourceTypeParseResume.dao";

// Import enums
import { BulkSourceTypeResumeProcessingStatusEnum } from "../enums/BulkSourceTypeResume.enum";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbBulkSourceTypeParseResumeDto } from "../db/gcp-firestore-models/BulkSourceTypeParseResume.model";

// Import services
import UlidService from "./Ulid.service";

class BulkSourceTypeParseResumeService {
   async bulkCreateBulkSourceTypeParseResume(requestBody: DbBulkSourceTypeParseResumeDto[]) {
      return bulkSourceTypeParseResumeDaoObj.bulkCreateBulkSourceTypeParseResume(requestBody);
   }
}

const bulkSourceTypeParseResumeServiceObj = new BulkSourceTypeParseResumeService();
export { bulkSourceTypeParseResumeServiceObj, BulkSourceTypeParseResumeService };

