
// Import google cloud firestore
import { DocumentData, QueryDocumentSnapshot } from "@google-cloud/firestore";

// Import models
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateJobMatchingDto } from "../db/gcp-firestore-models/CandidateJobMatching.model";

// Import services
import { jobServiceObj } from "../services/Job.service";
import { candidateParsedCvServiceObj } from "../services/CandidateParsedCv.service";

class InjectEntityDetailsHelper {
  async injectEntityDetailsForAgencyJobAssignment(
    agencyJobAssignments: DbAgencyJobAssignmentDto[],
    includeJobDetails?: boolean
  ): Promise<
    (DbAgencyJobAssignmentDto & {
      jobDetails?: DbJobAwsOpensearchDto;
    })[]
  > {
    if (!agencyJobAssignments || !agencyJobAssignments.length) {
      global.logger.info(`No agency job assignments are found.`, {
        includeJobDetails,
        methodName: this.injectEntityDetailsForAgencyJobAssignment.name,
      });
      return [];
    }

    if (!includeJobDetails) {
      global.logger.info(
        `No entity details are requested to be injected for agency job assignments.`,
        {
          includeJobDetails,
          methodName: this.injectEntityDetailsForAgencyJobAssignment.name,
        }
      );
      return agencyJobAssignments;
    }

    let jobDetailsMap: Map<string, DbJobAwsOpensearchDto> = new Map();

    // If includeJobDetails is true, inject job details
    if (includeJobDetails) {
      const uniqueJobIds: string[] = Array.from(
        new Set(
          agencyJobAssignments.map(
            (item: DbAgencyJobAssignmentDto) => item.jobId
          )
        )
      );

      jobDetailsMap = await jobServiceObj.getJobDetailsMapByIds(uniqueJobIds);
    }

    const agencyJobAssignmentsWithEntityDetails: (DbAgencyJobAssignmentDto & {
      jobDetails?: DbJobAwsOpensearchDto;
    })[] = agencyJobAssignments.map(
      (eachAgencyJobAssignment: DbAgencyJobAssignmentDto) => {
        const eachAgencyJobAssignmentWithEntityDetails: DbAgencyJobAssignmentDto & {
          jobDetails?: DbJobAwsOpensearchDto;
        } = {
          ...eachAgencyJobAssignment,

          // If includeJobDetails is true, inject job details
          ...(includeJobDetails && {
            jobDetails: jobDetailsMap.get(eachAgencyJobAssignment.jobId),
          }),
        };

        return eachAgencyJobAssignmentWithEntityDetails;
      }
    );

    return agencyJobAssignmentsWithEntityDetails;
  }

  async injectEntityDetailsForAgencyUserSubmission(
    agencyUserSubmissions: DbAgencyUserSubmissionDto[],
    includeJobDetails?: boolean,
    includeCandidateParsedCvDetails?: boolean
  ): Promise<
    (DbAgencyUserSubmissionDto & {
      jobDetails?: DbJobAwsOpensearchDto;
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[]
  > {
    if (!agencyUserSubmissions || !agencyUserSubmissions.length) {
      global.logger.info(`No agency user submissions are found.`, {
        includeJobDetails,
        includeCandidateParsedCvDetails,
        methodName: this.injectEntityDetailsForAgencyUserSubmission.name,
      });
      return [] as (DbAgencyUserSubmissionDto & {
        jobDetails?: DbJobAwsOpensearchDto;
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[];
    }

    if (!includeJobDetails && !includeCandidateParsedCvDetails) {
      global.logger.info(
        `No entity details are requested to be injected for agency user submissions.`,
        {
          includeJobDetails,
          includeCandidateParsedCvDetails,
          methodName: this.injectEntityDetailsForAgencyUserSubmission.name,
        }
      );
      return agencyUserSubmissions as (DbAgencyUserSubmissionDto & {
        jobDetails?: DbJobAwsOpensearchDto;
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[];
    }

    let jobDetailsMap: Map<string, DbJobAwsOpensearchDto> = new Map();

    // If includeJobDetails is true, inject job details
    if (includeJobDetails) {
      const uniqueJobIds: string[] = Array.from(
        new Set(
          agencyUserSubmissions.map(
            (item: DbAgencyUserSubmissionDto) => item.jobId
          )
        )
      );

      jobDetailsMap = await jobServiceObj.getJobDetailsMapByIds(uniqueJobIds);
    }

    let candidateParsedCvDetailsMap: Map<string, DbCandidateParsedCvDto> =
      new Map();

    // If includeCandidateParsedCvDetails is true, inject candidate parsed cv details
    if (includeCandidateParsedCvDetails) {
      const uniqueCandidateParsedCvIds: string[] = Array.from(
        new Set(
          agencyUserSubmissions.map(
            (item: DbAgencyUserSubmissionDto) => item.candidateParsedCvId
          )
        )
      );

      candidateParsedCvDetailsMap =
        await candidateParsedCvServiceObj.getCandidateParsedCvDetailsMapByIds(
          uniqueCandidateParsedCvIds
        );
    }

    const agencyUserSubmissionsWithEntityDetails: (DbAgencyUserSubmissionDto & {
      jobDetails?: DbJobAwsOpensearchDto;
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[] = agencyUserSubmissions.map(
      (eachAgencyUserSubmission: DbAgencyUserSubmissionDto) => {
        const eachAgencyUserSubmissionWithEntityDetails: DbAgencyUserSubmissionDto & {
          jobDetails?: DbJobAwsOpensearchDto;
          candidateParsedCvDetails?: DbCandidateParsedCvDto;
        } = {
          ...eachAgencyUserSubmission,

          // If includeJobDetails is true, inject job details
          ...(includeJobDetails && {
            jobDetails: jobDetailsMap.get(eachAgencyUserSubmission.jobId),
          }),

          // If includeCandidateParsedCvDetails is true, inject candidate parsed cv details
          ...(includeCandidateParsedCvDetails && {
            candidateParsedCvDetails: candidateParsedCvDetailsMap.get(
              eachAgencyUserSubmission.candidateParsedCvId
            ),
          }),
        };

        return eachAgencyUserSubmissionWithEntityDetails;
      }
    );

    return agencyUserSubmissionsWithEntityDetails;
  }

  async injectEntityDetailsForCorporateCandidateProfiles(
    corporateCandidateProfiles: DbCorporateCandidateProfileDto[],
    includeCandidateParsedCvDetails?: boolean,
    includeJobDetails?: boolean
  ): Promise<
    (DbCorporateCandidateProfileDto & {
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[]
  > {
    if (!corporateCandidateProfiles || !corporateCandidateProfiles.length) {
      global.logger.info(`No corporate candidate profiles are found.`, {
        includeCandidateParsedCvDetails,
        methodName: this.injectEntityDetailsForCorporateCandidateProfiles.name,
      });
      return [] as (DbCorporateCandidateProfileDto & {
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[];
    }

    if (!includeCandidateParsedCvDetails) {
      global.logger.info(
        `No entity details are requested to be injected for corporate candidate profiles.`,
        {
          includeCandidateParsedCvDetails,
          methodName:
            this.injectEntityDetailsForCorporateCandidateProfiles.name,
        }
      );
      return corporateCandidateProfiles as (DbCorporateCandidateProfileDto & {
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[];
    }

    let candidateParsedCvDetailsMap: Map<string, DbCandidateParsedCvDto> =
      new Map();

    // If includeCandidateParsedCvDetails is true, inject candidate parsed cv details
    if (includeCandidateParsedCvDetails) {
      const uniqueCandidateParsedCvIds: string[] = Array.from(
        new Set(
          corporateCandidateProfiles.map(
            (item: DbCorporateCandidateProfileDto) => item.candidateParsedCvId
          )
        )
      );

      candidateParsedCvDetailsMap =
        await candidateParsedCvServiceObj.getCandidateParsedCvDetailsMapByIds(
          uniqueCandidateParsedCvIds
        );
    }

    // If includeJobDetails is true, inject job details

    let jobDetailsMap: Map<string, DbJobAwsOpensearchDto> = new Map();

    // If includeJobDetails is true, inject job details
    if (includeJobDetails) {
      const uniqueJobIds: string[] = Array.from(
        new Set(
          corporateCandidateProfiles
            .map((item: DbCorporateCandidateProfileDto) => item.jobId)
            .filter((id: string | undefined): id is string => id !== undefined)
        )
      );

      jobDetailsMap = await jobServiceObj.getJobDetailsMapByIds(uniqueJobIds);
    }

    const corporateCandidateProfilesWithEntityDetails: (DbCorporateCandidateProfileDto & {
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[] = corporateCandidateProfiles.map(
      (eachCorporateCandidateProfile: DbCorporateCandidateProfileDto) => {
        const eachCorporateCandidateProfileWithEntityDetails: DbCorporateCandidateProfileDto & {
          candidateParsedCvDetails?: DbCandidateParsedCvDto;
        } = {
          ...eachCorporateCandidateProfile,

          // If includeCandidateParsedCvDetails is true, inject candidate parsed cv details
          ...(includeCandidateParsedCvDetails &&
            eachCorporateCandidateProfile.candidateParsedCvId && {
              candidateParsedCvDetails: candidateParsedCvDetailsMap.get(
                eachCorporateCandidateProfile.candidateParsedCvId
              ),
            }),

          // If includeJobDetails is true, inject job details
          ...(includeJobDetails &&
            eachCorporateCandidateProfile.jobId && {
              jobDetails: jobDetailsMap.get(
                eachCorporateCandidateProfile.jobId
              ),
            }),
        };

        return eachCorporateCandidateProfileWithEntityDetails;
      }
    );

    return corporateCandidateProfilesWithEntityDetails;
  }

  async injectEntityDetailsForCentralCandidateProfiles(
    centralCandidateProfiles: DbCentralCandidateProfileDto[],
    includeCandidateParsedCvDetails?: boolean
  ): Promise<
    (DbCentralCandidateProfileDto & {
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[]
  > {
    if (!centralCandidateProfiles || !centralCandidateProfiles.length) {
      global.logger.info(`No central candidate profiles are found.`, {
        includeCandidateParsedCvDetails,
        methodName: this.injectEntityDetailsForCentralCandidateProfiles.name,
      });
      return [] as (DbCentralCandidateProfileDto & {
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[];
    }

    if (!includeCandidateParsedCvDetails) {
      global.logger.info(
        `No entity details are requested to be injected for central candidate profiles.`,
        {
          includeCandidateParsedCvDetails,
          methodName: this.injectEntityDetailsForCentralCandidateProfiles.name,
        }
      );
      return centralCandidateProfiles as (DbCentralCandidateProfileDto & {
        candidateParsedCvDetails?: DbCandidateParsedCvDto;
      })[];
    }

    let candidateParsedCvDetailsMap: Map<string, DbCandidateParsedCvDto> =
      new Map();

    // If includeCandidateParsedCvDetails is true, inject candidate parsed cv details
    if (includeCandidateParsedCvDetails) {
      const uniqueCandidateParsedCvIds: string[] = Array.from(
        new Set(
          centralCandidateProfiles.map(
            (item: DbCentralCandidateProfileDto) =>
              item.latestCandidateParsedCvId
          )
        )
      );

      candidateParsedCvDetailsMap =
        await candidateParsedCvServiceObj.getCandidateParsedCvDetailsMapByIds(
          uniqueCandidateParsedCvIds
        );
    }

    const centralCandidateProfilesWithCandidateParsedCvDetails: (DbCentralCandidateProfileDto & {
      candidateParsedCvDetails?: DbCandidateParsedCvDto;
    })[] = centralCandidateProfiles.map(
      (eachCentralCandidateProfile: DbCentralCandidateProfileDto) => {
        const eachCentralCandidateProfileWithCandidateParsedCvDetails: DbCentralCandidateProfileDto & {
          candidateParsedCvDetails?: DbCandidateParsedCvDto;
        } = {
          ...eachCentralCandidateProfile,

          // If includeCandidateParsedCvDetails is true, inject candidate parsed cv details
          ...(includeCandidateParsedCvDetails &&
            eachCentralCandidateProfile.latestCandidateParsedCvId && {
              candidateParsedCvDetails: candidateParsedCvDetailsMap.get(
                eachCentralCandidateProfile.latestCandidateParsedCvId
              ),
            }),
        };

        return eachCentralCandidateProfileWithCandidateParsedCvDetails;
      }
    );

    return centralCandidateProfilesWithCandidateParsedCvDetails;
  }
}

const injectEntityDetailsHelperObj: InjectEntityDetailsHelper =
  new InjectEntityDetailsHelper();

export { injectEntityDetailsHelperObj, InjectEntityDetailsHelper };
