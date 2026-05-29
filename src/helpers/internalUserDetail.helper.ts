import APP_CONSTANTS from "../configs/constants.config";
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { UserDetailCreateDto } from "../dtos/UserDetail.dto";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";

/** CV S3 pointer fields stored on UserDetail (persisted via saveUnknown). */
export type UserDetailCvAwsS3PointerFields = {
  cvAwsS3ResourceType?: CandidateParsedCvAwsS3ResourceTypeEnum;
  cvAwsS3BucketName?: string;
  cvAwsS3FilePath?: string;
};

export function getUserDetailCvAwsS3Pointer(
  userDetails: DbUserDetailDto
): UserDetailCvAwsS3PointerFields {
  return userDetails as DbUserDetailDto & UserDetailCvAwsS3PointerFields;
}

/**
 * Copies CV filename and S3 pointer from candidateParsedCv onto UserDetail at create time.
 * USER_RESUME is only for self-registered uploads; internal users keep bulk/agency/admin pointers.
 */
export function buildInternalUserCvFieldsFromCandidateParsedCv(
  candidateParsedCv: DbCandidateParsedCvDto
): Pick<
  UserDetailCreateDto,
  "CV" | "userCvFileName" | "cvAwsS3ResourceType" | "cvAwsS3BucketName" | "cvAwsS3FilePath"
> {
  const cvCloudFileName = candidateParsedCv.cvAwsS3FileName;

  return {
    CV: cvCloudFileName,
    userCvFileName: cvCloudFileName,
    cvAwsS3ResourceType: candidateParsedCv.cvAwsS3ResourceType,
    cvAwsS3BucketName: candidateParsedCv.cvAwsS3BucketName,
    cvAwsS3FilePath: candidateParsedCv.cvAwsS3FilePath,
  };
}

/**
 * Resolves CV signed URL for UserDetail.
 * Internal users: stored S3 pointer or candidateParsedCv lookup — never USER_RESUME.
 * Self-registered users: users/{userId}/resumes (USER_RESUME).
 */
export async function generateCvSignedUrlForUserDetail(
  userDetails: DbUserDetailDto,
  candidateEmail: string
): Promise<string | null> {
  if (userDetails.isUserCreatedInternally) {
    const s3Pointer = getUserDetailCvAwsS3Pointer(userDetails);

    if (
      s3Pointer.cvAwsS3BucketName &&
      s3Pointer.cvAwsS3FilePath &&
      userDetails.CV
    ) {
      return awsS3ClientLibrary.generateObjectUrl(
        s3Pointer.cvAwsS3BucketName,
        `${s3Pointer.cvAwsS3FilePath}/${userDetails.CV}`
      );
    }

    return resolveInternalUserCvSignedUrlFromParsedCv(candidateEmail);
  }

  if (!userDetails.CV) {
    return null;
  }

  const userId: string = userDetails.SK?.split("#").pop() ?? "";
  const filePath: string = APP_CONSTANTS.AWS_S3_DIR_PATHS.USER_RESUME.strtr({
    "{userId}": userId,
  });

  return awsS3ClientLibrary.generateObjectUrl(
    process.env.APP_AWS_S3_BUCKET_WORKO_APP as string,
    `${filePath}/${userDetails.CV}`
  );
}

async function resolveInternalUserCvSignedUrlFromParsedCv(
  candidateEmail: string
): Promise<string | null> {
  const candidateParsedCvSnapshot =
    await candidateParsedCvDaoObj.getCandidateParsedCvByCandEmail(candidateEmail);

  if (candidateParsedCvSnapshot.empty) {
    return null;
  }

  const candidateParsedCv = candidateParsedCvSnapshot.docs[0].data() as DbCandidateParsedCvDto;

  if (
    !candidateParsedCv.cvAwsS3BucketName ||
    !candidateParsedCv.cvAwsS3FilePath ||
    !candidateParsedCv.cvAwsS3FileName
  ) {
    return null;
  }

  return awsS3ClientLibrary.generateObjectUrl(
    candidateParsedCv.cvAwsS3BucketName,
    `${candidateParsedCv.cvAwsS3FilePath}/${candidateParsedCv.cvAwsS3FileName}`
  );
}
