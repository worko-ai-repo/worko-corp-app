

// import dtos
import { AgencyBulkJdResumePreSignedUrlToUploadDto, PreSignedUrlToUploadFileResponseDto } from "./File.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

/**
 * AgencyBulkJdResumeCreateApiDto
 *
 * This dto comes from the request api
 */
export interface AgencyBulkJdResumeCreateApiDto {
  bulkCvs: AgencyBulkJdResumePreSignedUrlToUploadDto[];
}

export interface AgencyBulkJdResumeCreateResponseDto {
  agencyBulkJdId: string;
  bulkCvs: PreSignedUrlToUploadFileResponseDto[];
  bulkCvsStorageFailed: boolean;
}

export interface AgencyBulkJdResumeFilterOptions extends GcpFirestoreRecordListingFilterOptions {
  agencyBulkJdId: string;
}

export interface AgencyBulkJdResumeFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
  agencyBulkJdId: string;
}

export interface AgencyBulkJdResumeDbCvExtractedParsedDto {
  candidateName: string; //  "Rohith Appala";
  candidateEmail: string; // "rohithappala777@gmail.com";
  candidatePhoneNumber: string; // "+919666308100";
  candidateNumber: number; // 9666308100;
  candidatePhoneCountryCode: number; // 91;
  candidateCurrentCompany?: string; // "Worko.ai-India";
  candidateCurrentDesignation?: string; // "NodeJs Backend Developer";
  candidateExperience?: number; // 3;
  candidateTotalYOE?: number; // 3;
  candidateRelevantYOE?: number; // 4;
  candidateCurrentCTC?: number; // 10;
  candidateExpectedCTC?: number; // 9;
  candidateNoticePeriod?: number; // 60;
  candidateLocation?: string; // "Hyderabad, Telangana";
  candidateReadyToRelocate?: boolean; // false;
  isNoticePeriodNegotiable?: boolean; // false;

  coreSkills?: {
    skillName: string;
    years: number;
    timestamps?: {
      createdAt: string;
      updatedAt: string;
    };
  }[];
  technicalSkills?: {
    skillName: string;
    years: number;
    timestamps?: {
      createdAt: string;
      updatedAt: string;
    };
  }[];
  userPreferredDepartments?: string[];
  userPreferredIndustries?: string[];
  userPreferredlocations?: string[];
  userPreferredRoles?: string[];
}