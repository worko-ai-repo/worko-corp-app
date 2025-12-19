
// Import dtos
import { CommonPhoneNumberDto } from "./Common.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

// Import enums
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";

export interface CandidateParsedCvDbPhoneNumberDto extends CommonPhoneNumberDto {}

export interface CandidateParsedCvCorpEmbeddingListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
   pageNumber: number;
   searchByPrompt?: string;
   searchByJobId?: string;
   jobId?: string;
   currentCompany?: string;
   currentDesignation?: string;
   totalYOE?: number;
   relevantYOE?: number;
   currentCTC?: number;
   expectedCTC?: number;
   noticePeriod?: number;
   location?: string;
   readyToRelocate?: boolean;
   isNoticePeriodNegotiable?: boolean;
}

export interface CandidateParsedCvCorpEmbeddingListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
   pageNumber: number;
   searchByPrompt?: string;
   searchByJobId?: string;
   jobId?: string;
   currentCompany?: string;
   currentDesignation?: string;
   totalYOE?: number;
   relevantYOE?: number;
   currentCTC?: number;
   expectedCTC?: number;
   noticePeriod?: number;
   location?: string;
   readyToRelocate?: boolean;
   isNoticePeriodNegotiable?: boolean;
}

export interface CandidateParsedCvAwsS3FileTrackerDto {
  /**
   * @example 2024-12-17T11:36:46.753+00:00
   */
  actionDate: string;

  resourceType: CandidateParsedCvAwsS3ResourceTypeEnum;

  /**
   * @example
   *  1. "worko-app-dev"
   *  2. "worko-corporate-dev"
   */
  bucketName: string;

  /**
   * @example
   *  1. "/agencies/{agencyUserId}/companies/{companyId}/jobs/{jobId}/user-profiles"
   *  2. "/users/{userId}/resumes"
   *  3. "/companies/{companyId}/bulk-cvs/{corporateBulkJdId}"
   */
  filePath: string;

  /**
   * @description
   *  1. Name of the aws s3 file
   *
   * @example "01K8TPT1PT2W5DTRSFPWTB92GH.pdf"
   */
  fileName?: string;
};

export interface MoveToApplicantCandidateParsedCvCreateApiDTO {
  candidateParsedCvId: string;

  /**
   * jobId
   *
   * @reference `id` attribute of `CompanyJob.model.ts`
   */
  jobId: string;

  /**
   * companyName
   */
  companyName: string;
  jobTitle: string;
}

export interface CandidateParsedCvFindMatchingScoreApiDto {
  candidateParsedCvId: string;
  jobId: string;
}