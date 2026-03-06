// Import dtos
import { CommonPhoneNumberDto } from "../../dtos/Common.dto";

// Import enums
import { BulkSourceTypeParseResumeStatusEnum } from "../../enums/BulkSourceTypeParseResume.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbBulkSourceTypeParseResumeDto extends BaseFirestoreModel {
  candidateName: string;
  candidateEmail: string;
  phoneNumberDetails: CommonPhoneNumberDto;
  bulkSourceTypeResumeId: string;
  status: BulkSourceTypeParseResumeStatusEnum;
}

export { DbBulkSourceTypeParseResumeDto };
