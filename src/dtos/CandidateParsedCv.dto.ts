
// Import dtos
import { CommonPhoneNumberDto } from "./Common.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

// Import enums
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";

export interface CandidateParsedCvDbPhoneNumberDto extends CommonPhoneNumberDto {}

export interface CandidateParsedCvAdminEmbeddingListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
   pageNumber: number;
   searchByPrompt?: string;
   searchByJobId?: string;
}

export interface CandidateParsedCvAdminEmbeddingListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
   pageNumber: number;
   searchByPrompt?: string;
   searchByJobId?: string;
}

export interface CandidateParsedCvCorpEmbeddingListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
   pageNumber: number;
   searchByPrompt?: string;
   searchByJobId?: string;
}

export interface CandidateParsedCvCorpEmbeddingListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
   pageNumber: number;
   searchByPrompt?: string;
   searchByJobId?: string;
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
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;

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

export interface MoveToApplicantSubmitFormCandidateParsedCvCreateApiDTO {
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

export interface DuplicateJobApplicantBulkCandidateParsedCvApiDTO {
  jobId: string;
  applicantEmails: string[];
}

export interface MoveToApplicantBulkCandidateParsedCvCreateApiDTO {
  candidateParsedCvs: {
    candidateParsedCvId: string;
    currentCTC?: number;
    expectedCTC?: number;
    noticePeriod?: number;
  }[];
  jobId: string;
  companyName: string;
  jobTitle: string;
}

export interface CandidateParsedCvFindMatchingScoreApiDto {
  candidateParsedCvId: string;
  jobId: string;
}

export interface CandidateParsedCvBulkFindMatchingScoreApiDto {
  candidateParsedCvIds: string[];
  jobId: string;
}

export interface CandidateParsedCvUpdateApiDto {
  name?: string;
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

export interface CandidateParsedCvParseSubmitFormApiDto {
  companyId: string;
  jobId: string;

  /**
   * @reference "Amazon S3 > Buckets > worko-app-{environment}/candidate-submit-cvs/companies/{companyId}/jobs/{jobId}/cvs/<ulidId>.pdf"
   */
  candidateParsedCvAwsS3FileName: string;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
}

export interface CandidateParsedCvSubmitFormCreateApiDto {
  name: string;
  email: string;
  phoneNumberDetails: CommonPhoneNumberDto;
  currentCompany: string;
  currentDesignation: string;
  totalYOE: number;
  relevantYOE: number;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
  location: string;
  readyToRelocate: boolean;
  about?: string;
  education?: {
    collage: string;
    degree: string;
    startedYear?: number;
    passingYear: number;
    grade?: string;
    field?: string;
  }[];
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
  softSkills?: {
    skillName: string;
    timestamps?: {
      createdAt: string;
    };
  }[];
  userPreferredDepartments: string[];
  userPreferredIndustries: string[];
  userPreferredlocations: string[];
  userPreferredRoles: string[];
  
  cvAwsS3FileName: string;
  companyId: string;
  jobId: string;
}

export interface CandidateParsedCvParseSubmitFormResponseDto {
  name: string;
  email: string;
  phoneNumberDetails: CommonPhoneNumberDto;
  currentCompany: string;
  currentDesignation: string;
  totalYOE: number;
  relevantYOE: number;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
  location: string;
  readyToRelocate: boolean;
  about?: string;
  education?: {
    collage: string;
    degree: string;
    startedYear?: number;
    passingYear: number;
    grade?: string;
    field?: string;
  }[];
  multipleCandidateExperience?: {
    companyId?: string;
    companyName: string;
    designation: string;
    department?: string;
    YOE?: number;
    startDate?: string;

    /**
     * endDate
     *
     * @description if endDate is not provided or empty string, it will be considered as ongoing experience
     */
    endDate?: string;
  }[];
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
  userPreferredDepartments: string[];
  userPreferredIndustries: string[];
  userPreferredlocations: string[];
  userPreferredRoles: string[];
}

export interface CandidateParsedCvRefreshApiDto {
  candidateParsedCvId: string;
}

export interface CandidateParsedCvRefreshResponseDto {
  name: string;
  email: string;
  phoneNumberDetails: CommonPhoneNumberDto;
  currentCompany: string;
  currentDesignation: string;
  totalYOE: number;
  relevantYOE: number;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
  location: string;
  readyToRelocate: boolean;
  about?: string;
  education?: {
    collage: string;
    degree: string;
    startedYear?: number;
    passingYear: number;
    grade?: string;
    field?: string;
  }[];
  multipleCandidateExperience?: {
    companyId?: string;
    companyName: string;
    designation: string;
    department?: string;
    YOE?: number;
    startDate?: string;

    /**
     * endDate
     *
     * @description if endDate is not provided or empty string, it will be considered as ongoing experience
     */
    endDate?: string;
  }[];
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
  userPreferredDepartments: string[];
  userPreferredIndustries: string[];
  userPreferredlocations: string[];
  userPreferredRoles: string[];
}