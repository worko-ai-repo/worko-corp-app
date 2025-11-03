

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