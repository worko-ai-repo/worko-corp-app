// Import models
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

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
    if(!agencyUserSubmissions || !agencyUserSubmissions.length) {
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

    let candidateParsedCvDetailsMap: Map<string, DbCandidateParsedCvDto> = new Map();

    // If includeCandidateParsedCvDetails is true, inject candidate parsed cv details
    if (includeCandidateParsedCvDetails) {
      const uniqueCandidateParsedCvIds: string[] = Array.from(
        new Set(
          agencyUserSubmissions.map(
            (item: DbAgencyUserSubmissionDto) => item.candidateParsedCvId
          )
        )
      );

      candidateParsedCvDetailsMap = await candidateParsedCvServiceObj.getCandidateParsedCvDetailsMapByIds(uniqueCandidateParsedCvIds);
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
            candidateParsedCvDetails: candidateParsedCvDetailsMap.get(eachAgencyUserSubmission.candidateParsedCvId),
          }),
        };

        return eachAgencyUserSubmissionWithEntityDetails;
      }
    );

    return agencyUserSubmissionsWithEntityDetails;
  }
}

const injectEntityDetailsHelperObj: InjectEntityDetailsHelper =
  new InjectEntityDetailsHelper();

export { injectEntityDetailsHelperObj, InjectEntityDetailsHelper };
