
// Import dtos
import { CandidateParsedCvDbPhoneNumberDto } from "./CandidateParsedCv.dto";
import { CommonPhoneNumberDto } from "./Common.dto";

export interface AgencyUserSubmissionCandidateParseCvApiDto {
  companyId: string;
  jobId: string;

  /**
   * @reference "Amazon S3 > Buckets > worko-app-{environment}/agencies/{agencyUserId}/companies/{companyId}/jobs/{jobId}/user-profiles/<ulidId>.pdf"
   */
  candidateParsedCvAwsS3FileName: string;
}

export interface AgencyUserSubmissionCandidateParseCvResponseDto {
  name: string;
  email: string;
  phoneNumberDetails: CommonPhoneNumberDto;
  currentCompany: string;
  currentDesignation: string;
  totalYOE: number;
  relevantYOE: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: number;
  location: string;
  readyToRelocate: boolean;
}

export interface AgencyUserSubmissionCreateApiDto {
  name: string;
  email: string; // candidate email
  phoneNumberDetails: CandidateParsedCvDbPhoneNumberDto;
  currentCompany: string;
  currentDesignation: string;
  totalYOE: number;
  relevantYOE: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: number;
  isNoticePeriodNegotiable: boolean;
  location: string;
  readyToRelocate: boolean;
  cvAwsS3FileName: string;

  companyId: string;
  jobId: string;

  agencyComments: string;
}
