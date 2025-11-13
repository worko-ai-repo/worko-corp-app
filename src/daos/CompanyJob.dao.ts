// Load QueryResponse from dynamoose
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import BaseDao from "./BaseAwsDynamodb.dao";

// Load Model
import {
  DbCompanyJobDto,
  CompanyJobModel,
} from "../db/aws-dynamodb-models/CompanyJob.model";

/**
 * CompanyJobDao
 */
class CompanyJobDao implements BaseDao {
  // Define the model name, partitian key and sort keys for CompanyJob
  modelName: string = "CompanyJob";
  partitianKey: string = "COMP#ID#{companyId}#";
  sortKeys: { SK_INIT: string } = { SK_INIT: "JOBS#ID#{id}" };
  GSI1PK: string = "JOBS#";
  GSI1SK = "ID#{id}";

  /**
   * preparePKAndSKForQuery
   *
   * Prepares the partition key and sort key for a query.
   *
   * @param {string} companyId - The companyId of the job.
   * @param {string} jobId - The id of the job.
   *
   * @returns {{PK: string, SK: string}} - An object containing the partition key and sort key.
   */
  preparePKAndSKForQuery(
    companyId: string,
    jobId: string
  ): {
    PK: string;
    SK: string;
  } {
    return {
      PK: this.partitianKey.strtr({
        "{companyId}": companyId,
      }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{id}": jobId,
      }),
    };
  }

  /**
   * getJobById
   *
   * Fetches a Job by its ID.
   *
   * @param {string} jobId - The ID of the Job to fetch
   *
   * @returns {Promise<QueryResponse<DbCompanyJobDto>>} - Promise resolving to the fetched Job object
   *
   * @see {CompanyJobModel} - The model used to interact with the database
   */
  async getJobById(jobId: string): Promise<QueryResponse<DbCompanyJobDto>> {
    // Logger message
    global.logger.info("Fetching Job by ID. [dao]", {
      filePath: __filename,
      methodName: this.getJobById.name,
      jobId: jobId,
    });

    // Return the final combined data
    return CompanyJobModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(this.GSI1SK.replace("{id}", jobId))
      .exec();
  }
}

// Define Instance of the CompanyDao class
const companyJobDaoObj = new CompanyJobDao();

export { CompanyJobDao, companyJobDaoObj };
