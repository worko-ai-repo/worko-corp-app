
// Import dtos
import { BulkSourceTypeResumeCreateApiDto } from "./BulkSourceTypeResume.dto";

// Import daos
import { bulkSourceTypeResumeDaoObj } from "../daos/BulkSourceTypeResume.dao";

// Import enums
import { BulkSourceTypeResumeProcessingStatusEnum } from "../enums/BulkSourceTypeResume.enum";

// Import helpers
import { getActionByUserId } from "../helpers/user.helper";
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbBulkSourceTypeResumeDto } from "../db/gcp-firestore-models/BulkSourceTypeResume.model";

// Import services
import UlidService from "./Ulid.service";

class BulkSourceTypeResumeService {
   async createBulkSourceTypeResume(requestBody: BulkSourceTypeResumeCreateApiDto) {
      const {
         actionByCorporateUserId,
         actionByUserId
      } = getActionByUserId();
      const date: string = dateHelperObj.getISODate();
      return bulkSourceTypeResumeDaoObj.createBulkSourceTypeResume({
         id: UlidService.getUlidId(),
         createdAt: date,
         updatedAt: date,
         createdByCorporateUserId: actionByCorporateUserId,
         createdByUserId: actionByUserId,
         totalResumesSucceeded: 0,
         totalResumesDuplicate: 0,
         totalResumesFailed: 0,
         totalResumesProcessed: 0,
         processingStatus: BulkSourceTypeResumeProcessingStatusEnum.PROCESSING,
         ...requestBody
      });
   }

   async getBulkSourceTypeResumeById(id: string): Promise<DbBulkSourceTypeResumeDto | undefined> {
      return bulkSourceTypeResumeDaoObj.getBulkSourceTypeResumeById(id);
   }
}

const bulkSourceTypeResumeServiceObj = new BulkSourceTypeResumeService();
export { bulkSourceTypeResumeServiceObj, BulkSourceTypeResumeService };