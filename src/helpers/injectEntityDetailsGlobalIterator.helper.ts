
// Import models
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";
import { DbAgencyJobAssignmentDto } from "../db/gcp-firestore-models/AgencyJobAssignment.model";

// Import services
import { jobServiceObj } from "../services/Job.service";

class InjectEntityDetailsGlobalIteratorHelper {
  async injectEntityDetailsForAgencyJobAssignment(
    agencyJobAssignments: DbAgencyJobAssignmentDto[],
    includeJobDetails?: boolean
  ): Promise<
    (DbAgencyJobAssignmentDto & {
      jobDetails?: DbJobAwsOpensearchDto;
    })[]
  > {
    if(!agencyJobAssignments || !agencyJobAssignments.length) {
      global.logger.info(
        `No agency job assignments are found.`,
        {
          includeJobDetails,
          methodName: this.injectEntityDetailsForAgencyJobAssignment.name,
        }
      );
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

      const retrievedJobDetails: DbJobAwsOpensearchDto[] = await jobServiceObj.getAllJobsByJobIdsWithouPagination(uniqueJobIds);

      jobDetailsMap = new Map(
        retrievedJobDetails.map((job: DbJobAwsOpensearchDto) => [job.id, job])
      );
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
}

const injectEntityDetailsGlobalIteratorHelper: InjectEntityDetailsGlobalIteratorHelper =
  new InjectEntityDetailsGlobalIteratorHelper();

export {
  injectEntityDetailsGlobalIteratorHelper,
  InjectEntityDetailsGlobalIteratorHelper,
};
