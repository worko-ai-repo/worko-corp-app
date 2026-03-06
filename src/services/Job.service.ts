
// Import daos
import { jobDaoObj } from "../daos/Job.dao";

// Import dtos
import { AwsOpensearchRecordListingResponseDTO } from "../dtos/Common.aws-opensearch.dto";

// Import models
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";

class JobService {
  async getAllJobsByJobIdsWithouPagination(
    jobIds: string[]
  ): Promise<DbJobAwsOpensearchDto[]> {
    return jobDaoObj.getAllJobsByJobIdsWithouPagination(jobIds);
  }

  async getJobDetailsMapByIds(
    jobIds: string[]
  ): Promise<Map<string, DbJobAwsOpensearchDto>> {
    const retrievedJobDetails: DbJobAwsOpensearchDto[] =
      await this.getAllJobsByJobIdsWithouPagination(jobIds);

    return new Map(
      retrievedJobDetails.map((job: DbJobAwsOpensearchDto) => [job.id, job])
    );
  }

  /**
   * getJobByIdFromAwsOpensearch
   *
   * Retrieves a job by its ID.
   *
   * This method fetches the job details from AWS OpenSearch using the given job ID.
   * It logs the operation and returns a promise that resolves to the job details.
   *
   * @param {string} id - The ID of the job to retrieve.
   * @returns {Promise<DbJobAwsOpensearchDto | undefined>} A promise that resolves to the job details.
   */
  async getJobByIdFromAwsOpensearch(
    id: string
  ): Promise<DbJobAwsOpensearchDto | undefined> {
    // logger
    global.logger.info(`Get Job By Id From aws opensearch [Service]`, {
      methodName: this.getJobByIdFromAwsOpensearch.name,
    });

    return jobDaoObj.getJobById(id);
  }
}

const jobServiceObj = new JobService();
export { jobServiceObj, JobService };