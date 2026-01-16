

export interface AgencyUserInviteContractCopyPsuToUploadApiDto {
  companyId: string;
  agencyInviteId: string;

  /**
   * @example "contract-copy.pdf"
   */
  fileName: string;

  /**
   * @example "application/pdf"
   */
  fileMimeType: string;
}

/**
 * PreSignedUrlToUploadFileResponseDto
 */
export interface PreSignedUrlToUploadFileResponseDto {
  /**
   * fileName
   *
   * @example "InternshipCertificate.pdf"
   */
  userFileName: string;

  /**
   * cloudFileName
   *
   * 1. File name which is stored in AWS S3 bucket
   */
  cloudFileName: string;

  /**
   * fileMimeType
   *
   * @example "application/pdf"
   */
  fileMimeType: string;

  /**
   * fileExtension
   *
   * @example "pdf"
   */
  fileExtension: string;

  /**
   * awsS3SignedUrl
   * 
   * AWS S3 Signed Url used to upload the file to AWS S3
   */
  awsS3SignedUrl: string;
}

export interface AgencyUserInviteContractCopyPsuToViewApiDto {
  companyId: string;
  agencyInviteId: string;

  /**
   * @example "{ulidId}.pdf"
   */
  contractCopyAwsS3FileName: string;
}

export interface PreSignedUrlToViewFileResponseDto {
  objectUrl: string;
}

export interface AgencyUserSubmissionCvPsuToUploadApiDto {
  companyId: string;
  jobId: string;
  /**
   * @example "raj_cv.pdf"
   */
  fileName: string;

  /**
   * @example "application/pdf"
   */
  fileMimeType: string;
}


export interface AgencyUserSubmissionCvPsuToViewApiDto {
  companyId: string;
  jobId: string;

  /**
   * @reference "id" field of "AgencyUser.model.ts"
   * @description The registered agency user who submitted the "candidate profile"
   */
  agencyUserId: string;

  /**
   * @example "{ulidId}.pdf"
   */
  candidateCvAwsS3FileName: string;
}

/**
 * AgencyBulkJdResumePreSignedUrlToUploadDto
 */
export interface AgencyBulkJdResumePreSignedUrlToUploadDto {
  /**
   * fileName
   *
   * Sample file name: "TestCV.pdf"
   */
  fileName: string;

  /**
   * fileMimeType
   *
   * Sample file mime type: "application/pdf"
   */
  fileMimeType: string;
}

export interface AgencyBulkCvsPreSignedUrlToUploadFileDto {
  /**
   * @reference "id" field of "AgencyBulkJd.model.ts"
   */
  agencyBulkJdId: string;

  /**
   * bulkCvs
   */
  bulkCvs: Array<AgencyBulkJdResumePreSignedUrlToUploadDto>;
}

export interface AgencyBulkCvsPsuToViewApiDto {
  /**
   * @reference "id" field of "AgencyBulkJd.model.ts"
   */
  agencyBulkJdId: string;

  /**
   * @example "{ulidId}.pdf"
   */
  bulkCvsAwsS3FileName: string;
}

export interface CorpCandBulkCvUploadPsuToViewApiDto {
  companyId: string // corporate registered companyId
  candCvAwsS3FileName: string // "57RTFCG.pdf"
}

export interface CorpCandReferralCvPsuToViewApiDto {
  companyId: string // corporate registered companyId
  candCvAwsS3FileName: string // "57RTFCG.pdf"
}

export interface AdminCandBulkCvUploadPsuToViewApiDto {
  candCvAwsS3FileName: string
}