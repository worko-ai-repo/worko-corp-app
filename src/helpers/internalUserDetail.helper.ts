import APP_CONSTANTS from "../configs/constants.config";
import { awsS3ClientLibrary } from "../configs/aws-sdk.config";
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbUserDetailDto } from "../db/aws-dynamodb-models/UserDetail.model";
import {
  UserDetailCreateDto,
  UserDetailDbCandidateExperienceDto,
} from "../dtos/UserDetail.dto";

export interface InternalUserDetailCtcOverrides {
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriod?: number;
}

/**
 * Profile and CV fields copied from Firestore candidateParsedCv when creating or
 * enriching an internally created UserDetail record.
 */
export function buildInternalUserProfileFieldsFromCandidateParsedCv(
  candidateParsedCv: DbCandidateParsedCvDto,
  overrides?: InternalUserDetailCtcOverrides
): Partial<UserDetailCreateDto> & {
  userCvFileName?: string;
  CTC?: number;
  noticePeriod?: number;
  isNoticePeriodNegotiable?: boolean;
  location?: string;
  about?: string;
  multipleCandidateExperience?: UserDetailDbCandidateExperienceDto[];
  multipleCandidateExperiencedDate?: string;
  candidateExperience?: UserDetailDbCandidateExperienceDto;
} {
  const cvCloudFileName = candidateParsedCv.cvAwsS3FileName;

  const multipleCandidateExperience: UserDetailDbCandidateExperienceDto[] | undefined =
    candidateParsedCv.multipleCandidateExperience?.map((experience) => ({
      companyId: experience.companyId,
      companyName: experience.companyName,
      designation: experience.designation,
      department: experience.department ?? "",
      YOE: experience.YOE,
      startDate: experience.startDate,
      endDate: experience.endDate,
    }));

  let candidateExperience: UserDetailDbCandidateExperienceDto | undefined;
  if (candidateParsedCv.currentCompany && candidateParsedCv.currentDesignation) {
    candidateExperience = {
      companyName: candidateParsedCv.currentCompany,
      designation: candidateParsedCv.currentDesignation,
      department: "",
      YOE: candidateParsedCv.relevantYOE,
    };
  }

  return {
    CV: cvCloudFileName,
    userCvFileName: cvCloudFileName,
    CTC: overrides?.currentCTC ?? candidateParsedCv.currentCTC,
    ECTC: overrides?.expectedCTC ?? candidateParsedCv.expectedCTC,
    noticePeriod: overrides?.noticePeriod ?? candidateParsedCv.noticePeriod,
    isNoticePeriodNegotiable: candidateParsedCv.isNoticePeriodNegotiable,
    YOE: candidateParsedCv.relevantYOE ?? candidateParsedCv.totalYOE,
    location: candidateParsedCv.location,
    about: candidateParsedCv.about,
    multipleCandidateExperience,
    multipleCandidateExperiencedDate: multipleCandidateExperience?.length
      ? new Date().toISOString()
      : undefined,
    candidateExperience,
  };
}

export async function generateCvSignedUrlForUserDetail(
  userDetails: DbUserDetailDto,
  candidateEmail: string
): Promise<string | null> {
  if (!userDetails.CV) {
    return null;
  }

  if (userDetails.isUserCreatedInternally) {
    const candidateParsedCvSnapshot =
      await candidateParsedCvDaoObj.getCandidateParsedCvByCandEmail(
        candidateEmail
      );

    if (!candidateParsedCvSnapshot.empty) {
      const candidateParsedCv = candidateParsedCvSnapshot.docs[0].data() as DbCandidateParsedCvDto;

      if (
        candidateParsedCv.cvAwsS3BucketName &&
        candidateParsedCv.cvAwsS3FilePath &&
        candidateParsedCv.cvAwsS3FileName
      ) {
        return awsS3ClientLibrary.generateObjectUrl(
          candidateParsedCv.cvAwsS3BucketName,
          `${candidateParsedCv.cvAwsS3FilePath}/${candidateParsedCv.cvAwsS3FileName}`
        );
      }
    }
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
