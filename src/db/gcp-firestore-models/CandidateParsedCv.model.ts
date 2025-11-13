
// Import dtos
import { CandidateParsedCvDbPhoneNumberDto } from "../../dtos/CandidateParsedCv.dto";

// Import models
import { BaseFirestoreModel } from "./Base.model";

interface DbCandidateParsedCvDto extends BaseFirestoreModel {
  name: string;
  email: string;
  phoneNumberDetails: CandidateParsedCvDbPhoneNumberDto;
  currentCompany: string;
  currentDesignation: string;
  totalYOE: number;
  relevantYOE: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: number;
  location: string;
  readyToRelocate: boolean;
  cvAwsS3FileName: string;
  isNoticePeriodNegotiable: boolean;
}

export { DbCandidateParsedCvDto };