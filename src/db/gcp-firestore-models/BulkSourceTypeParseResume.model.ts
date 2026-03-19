// Import dtos
import { CommonPhoneNumberDto } from "../../dtos/Common.dto";

// Import enums
import { BulkSourceTypeParseResumeStatusEnum } from "../../enums/BulkSourceTypeParseResume.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbBulkSourceTypeParseResumeDto extends BaseFirestoreModel {
  candidateName?: string;
  candidateEmail?: string;
  phoneNumberDetails?: CommonPhoneNumberDto;

  /**
   * @description 
   *  1. Whenever "status" is "LARGE_RESUME_FILE" then we will store the `corporate` or` worko-admin`
   *     uploaded resume file name in this field, so that we can send this file is large file in emails
   */
  userResumeFileName?: string; 

  bulkSourceTypeResumeId: string;
  status: BulkSourceTypeParseResumeStatusEnum;
}

export { DbBulkSourceTypeParseResumeDto };
