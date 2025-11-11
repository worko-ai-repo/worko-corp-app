
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
}

const jobServiceObj = new JobService();
export { jobServiceObj, JobService };