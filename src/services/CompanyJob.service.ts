
// Import dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import { companyJobDaoObj } from "../daos/CompanyJob.dao";

// Import models
import { DbCompanyJobDto } from "../db/aws-dynamodb-models/CompanyJob.model";

// Import Utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CompanyJobService {
  /**
   * getJobById
   *
   * Get Company Job By Id
   *
   * @param {string} jobId - Job Id
   *
   * @returns {Promise<QueryResponse<DbCompanyJobDto>>}
   */
  async getJobById(jobId: string): Promise<QueryResponse<DbCompanyJobDto>> {
    // Global Logger for the service
    global.logger.info(`Fetching Job by ID: ${jobId} [service]`, {
      filePath: __filename,
      methodName: this.getJobById.name,
    });

    // Fetch Job by Id and Check if the job exists
    const jobDetailById = await companyJobDaoObj.getJobById(jobId);
    if (!jobDetailById.length) {
      throw new BaseError(
        `The Company Job not found.`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return jobDetailById;
  }
}


const companyJobServiceObj = new CompanyJobService();

export { companyJobServiceObj, CompanyJobService };