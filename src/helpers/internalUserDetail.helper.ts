import APP_CONSTANTS from "../configs/constants.config";
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import { UserDetailCreateDto } from "../dtos/UserDetail.dto";

/**
 * Sets the existing CV filename on UserDetail when creating an internal user.
 * Bucket and path are resolved from candidateParsedCv at read time (not stored on UserDetail).
 */
export function buildInternalUserCvFieldsFromCandidateParsedCv(
  candidateParsedCv: DbCandidateParsedCvDto
): Pick<UserDetailCreateDto, "CV" | "userCvFileName"> {
  const cvCloudFileName = candidateParsedCv.cvAwsS3FileName;

  return {
    CV: cvCloudFileName,
    userCvFileName: cvCloudFileName,
  };
}

/**
 * Resolves CV signed URL for UserDetail.
 * Internal users: candidateParsedCv S3 location (bulk/agency/admin paths).
 * Self-registered users: users/{userId}/resumes (USER_RESUME).
 */
export async function generateCvSignedUrlForUserDetail(
  userDetails: DbUserDetailDto,
  candidateEmail: string
): Promise<string | null> {
  if (userDetails.isUserCreatedInternally) {
    return resolveInternalUserCvSignedUrl(candidateEmail);
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

async function resolveInternalUserCvSignedUrl(
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
