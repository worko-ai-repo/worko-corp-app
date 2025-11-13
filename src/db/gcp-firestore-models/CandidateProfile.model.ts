
// Import dtos
import { CandidateProfileDbPhoneNumberDto } from "../../dtos/CandidateProfile.dto";

// Import enums
import { CandidateProfileDbRefereeTypeEnum } from "../../enums/CandidateProfile.enum";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbCandidateProfileDto extends BaseFirestoreModel {
  companyId: string;
  jobId?: string;
  candidateEmail: string;

  /**
   * @todo: 
   *  1. If "phoneNumberDetails" is updated by someone then we need to update it in "CandidateParsedCv" model also
   */
  phoneNumberDetails: CandidateProfileDbPhoneNumberDto;

  refereeType: CandidateProfileDbRefereeTypeEnum;

  /**
   * @reference "id" field of "CandidateParsedCv.model.ts"
   */
  candidateParsedCvId: string;

  /**
   * @reference "id" field of "AgencyUserSubmission.model.ts"
   */
  agencyUserSubmissionId?: string;

  /**
   * @reference "id" attribute of "UserDetail.model.ts" from "AWS Dynamodb"
   * @description
   *  1. If the candidate is registered in "worko" job portal then "userDetailId" will be available
   */
  userDetailId?: string;
}

export { DbCandidateProfileDto };