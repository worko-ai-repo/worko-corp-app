
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

  async getJobDetailsMapByIds(jobIds: string[]):Promise<Map<string, DbJobAwsOpensearchDto>> {
    const retrievedJobDetails: DbJobAwsOpensearchDto[] =
      await this.getAllJobsByJobIdsWithouPagination(jobIds);

    return new Map(
      retrievedJobDetails.map((job: DbJobAwsOpensearchDto) => [job.id, job])
    );
  }
}

const jobServiceObj = new JobService();
export { jobServiceObj, JobService };