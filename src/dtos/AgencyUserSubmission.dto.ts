
// Import dtos
import { CandidateParsedCvDbPhoneNumberDto } from "./CandidateParsedCv.dto";
import { CommonMatchingScoreDetailDto, CommonPhoneNumberDto } from "./Common.dto";
import { GcpFirestoreRecordListingFilterOptions, GcpFirestoreRecordListingFilterRequestDTO } from "./Common.gcp-firestore.dto";

export interface AgencyUserSubmissionCandidateParseCvApiDto {
  companyId: string;
  jobId: string;

  /**
   * @reference "Amazon S3 > Buckets > worko-app-{environment}/agencies/{agencyUserId}/companies/{companyId}/jobs/{jobId}/user-profiles/<ulidId>.pdf"
   */
  candidateParsedCvAwsS3FileName: string;

  agencyUserInviteId: string;
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
  about?: string;
  education?: {
    collage?: string;
    degree?: string;
    startedYear?: number;
    passingYear?: number;
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
  location: string;
  readyToRelocate: boolean;
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
  cvAwsS3FileName: string;

  companyId: string;
  jobId: string;

  agencyComments?: string;

  /**
   * @reference "id" field of "AgencyUserInvite.model.ts" collection
   */
  agencyUserInviteId: string;
}

export interface AgencyUserSubmissionListingFilterOptions extends GcpFirestoreRecordListingFilterOptions {
  agencyRegisteredEmail?: string;
  companyId?: string;
  jobId?: string;
  agencyJobAssignedByCorporateUserId?: string;
  agencyName?: string;
  includeJobDetails?: boolean;
  includeCandidateParsedCvDetails?: boolean;
}

export interface AgencyUserSubmissionListingFilterRequestDTO extends GcpFirestoreRecordListingFilterRequestDTO {
  agencyRegisteredEmail?: string;  
  companyId?: string;
  jobId?: string;
  agencyJobAssignedByCorporateUserId?: string;
  agencyName?: string;
  includeJobDetails?: boolean;
  includeCandidateParsedCvDetails?: boolean;
}


export interface AgencyUserSubmissionFindMatchingScoreApiDto {
  agencyUserSubmissionId: string;
}

export interface AgencyUserSubmissionBulkFindMatchingScoreApiDto {
  agencyUserSubmissionIds: string[];
}

export interface AgencyUserSubmissionDbMatchingScoreDetailDto extends CommonMatchingScoreDetailDto {

}

export interface AgencyUserSubmissionInvokedMatchingScoreResponseDto extends AgencyUserSubmissionDbMatchingScoreDetailDto {
  
}

export interface AgencyUserSubmissionMoveToApplicantCreateApiDTO {
  /**
   * @reference "id" field of "AgencyUserSubmission.model.ts" collection
   */
  agencyUserSubmissionId: string;

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

export interface AgencyUserSubmissionSendForEvaluationCreateApiDTO {
  /**
   * @reference "id" field of "AgencyUserSubmission.model.ts" collection
   */
  agencyUserSubmissionId: string;

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

export interface AgencyUserSubmissionSendForEvaluationBulkCreateApiDTO {
  agencyUserSubmissions: {
    agencyUserSubmissionId: string;
    currentCTC?: number;
    expectedCTC?: number;
    noticePeriod?: number;
    jobId: string;
    companyName: string;
    jobTitle: string;
  }[];
}

export interface AgencyUserSubmissionRejectApplicantCreateApiDTO {
  agencyUserSubmissionId: string;
  rejectApplicantReason: string;
  rejectApplicantDetailedReason?: string;
}

export interface AgencyUserSubmissionRejectApplicantBulkApiDTO {
  agencyUserSubmissionIds: string[];
  rejectApplicantReason: string;
  rejectApplicantDetailedReason?: string;
}

export interface AgencyUserSubmissionMoveToApplicantBulkCreateApiDTO {
  agencyUserSubmissions: {
    agencyUserSubmissionId: string;
    currentCTC?: number;
    expectedCTC?: number;
    noticePeriod?: number;
    jobId: string;
    companyName: string;
    jobTitle: string;
  }[];
}