// Import dtos
import {
  AwsOpensearchRecordListingFilterOptions,
  AwsOpensearchRecordListingFilterRequestDTO,
} from "./Common.aws-opensearch.dto";

// Import enums
import {
  JobDashboardEnum,
  JobStatusEnum,
  JobWorkModeEnum,
} from "../enums/Job.enum";
import { CorporateUserTypeEnum } from "../enums/CorporateUser.enum";

/**
 * JobListingFilterOptions
 *
 * This is the DTO used by Backend to get the Query Params for the Job Listing.Listing.
 */
export interface JobListingFilterOptions
  extends AwsOpensearchRecordListingFilterOptions {
  /**
   * If this is true then it means that we will retrieve the jobs from s3 vector.
   */
  fromS3Vector?: boolean;

  /**
   * This is for pagination implementation in s3 vector
   */
  s3VectorPageNumber?: number;

  dashboard?: JobDashboardEnum;
  companyId?: string;
  location?: string;
  minExperience?: number; // Converted to number datatype by `Joi` schema.
  maxExperience?: number; // Converted to number datatype by `Joi` schema.
  minSalary?: number; // Converted to number datatype by `Joi` schema.
  maxSalary?: number; // Converted to number datatype by `Joi` schema.
  department?: string[]; // Converted to array datatype by `Joi` schema.
  softSkills?: string[]; // Converted to array datatype by `Joi` schema.
  coreSkills?: string[]; // Converted to array datatype by `Joi` schema.
  technicalSkills?: string[]; // Converted to array datatype by `Joi` schema.
  workMode?: string;
  status?: JobStatusEnum;
  jobTitle?: string;
  typeofEmployment?: string;
  companyName?: string;
  YOE?: number;
  userRole?: CorporateUserTypeEnum;
  corporateRecruiterUserId?: string; // `id` attribute from `CorporateUser.model.ts`

  /**
   * @description: Whenever `corporate` or `worko-admin` clicks directly the `Applicants` tab directly without
   * selecting a job, we are showing a popup to search a job and select a job to list all the job applications
   * for that selected job. But we are attaching the company details also, to avoid attaching company details
   * for this use case. We are using this field.
   */
  includeCompanyDetails?: boolean;

  /**
   * @description: While listing jobs in `corporate` or `worko-admin` dashboard
   * we will show the counts of user job applications for each job, If we want to show this count we will set this field to `true`.
   */
  includeCountCompanyJobEntityJobApplication?: boolean;
}

/**
 * JobListingFilterRequestDTO
 *
 * This is the Dto for Receving the Query Params for the Job Listing which extends the AwsOpensearchRecordListingFilterRequestDTO
 *
 * AwsOpensearchRecordListingFilterOptions is the DTO that contains the common fields for the Query Params i.e Sort, Limit, Page, Search etc.
 * and JobListingFilterOptions contains the fields that are specific to the Job
 */
export interface JobListingFilterRequestDTO
  extends AwsOpensearchRecordListingFilterRequestDTO {
  fromS3Vector?: boolean;
  s3VectorPageNumber?: string; // "1" which can be convertable to a number at `Joi` schema.
  dashboard?: JobDashboardEnum;
  companyId?: string;
  location?: string;
  minExperience?: string; // Sample value : "2" which can be convertable to a number at `Joi` schema.
  maxExperience?: string; // Sample value : "2" which can be convertable to a number at `Joi` schema.
  minSalary?: string; // Sample value : "2" which can be convertable to a number at `Joi` schema.
  maxSalary?: string; // Sample value : "2" which can be convertable to a number at `Joi` schema.
  department?: string; // Sample value : "IT,HR"
  softSkills?: string; // Sample value : "communication,teamwork,leadership"
  coreSkills?: string; // Sample value : "communication,teamwork,leadership"
  technicalSkills?: string; // Sample value : "ts,js,react"
  workMode?: string;
  status?: JobStatusEnum;
  jobTitle?: string;
  typeofEmployment?: string;
  companyName?: string;
  YOE?: string;

  /**
   * @description
   *  1. As of now we are using "userRole" and "corporateRecruiterUserId" for below scenarios:
   *     1. For `corporate-admin`:
   *        1. Only jobs from their `Company`:
   *           1. Include `corporate-admin` created jobs
   *           2. Include `corporate-recruiter` created jobs
   *     2. For `corporate-recruiter`:
   *        1. Only jobs from their `Company`:
   *           1. Include `corporate-recruiter` created jobs
   */
  userRole?: CorporateUserTypeEnum;
  corporateRecruiterUserId?: string; // `id` attribute from `CorporateUser.model.ts`

  /**
   * @description: Whenever `corporate` or `worko-admin` clicks directly the `Applicants` tab directly without
   * selecting a job, we are showing a popup to search a job and select a job to list all the job applications
   * for that selected job. But we are attaching the company details also, to avoid attaching company details
   * for this use case. We are using this field.
   */
  includeCompanyDetails?: boolean;

  /**
   * @description: While listing jobs in `corporate` or `worko-admin` dashboard
   * we will show the counts of job applications for each job, If we want to show this count we will set this field to `true`.
   */
  includeCountCompanyJobEntityJobApplication?: boolean;
}

/**
 * JobCreateCompanyDetailInternalDto
 */
export interface JobCreateCompanyDetailInternalDto {
  companyName: string;
  companyUrl?: string;
  companyLogoUrl?: string;
}


export interface SalaryRangeDto {
  min?: number;
  max?: number;
  fixedComponentPercentage?: number;
  variableComponentPercentage?: number;
}
