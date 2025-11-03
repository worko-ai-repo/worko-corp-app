import { BaseFirestoreModel } from "./Base.model";

interface CandidateCvParsed extends BaseFirestoreModel {
  userId?: string;
  name: string;
  email: string;
  phoneNumberDetails: object;
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
  comments?: string;
}

export { CandidateCvParsed };