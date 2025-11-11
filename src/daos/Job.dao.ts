
// Import opensearch related types
import { Search_RequestBody } from "@opensearch-project/opensearch/api";

// Import dtos
import { JobListingFilterOptions } from "../dtos/Job.dto";
import { AwsOpensearchRecordListingResponseDTO } from "../dtos/Common.aws-opensearch.dto";

// Import enums
import { OpenSearchOperationsEnum } from "../enums/Common.enum";

// Import models
import { DbJobAwsOpensearchDto } from "../db/aws-opensearch-models/Job.model";

// Import utils
import { invokeVpcLambdaOpenSearchUtilObj } from "../utils/invoke-vpc-lambda-opensearch.util";

class JobDao {
  IndexName = "worko-jobs";

  async getAllJobsByJobIdsWithouPagination(
    jobIds: string[]
  ): Promise<DbJobAwsOpensearchDto[]> {
    // Construct the AWS OpenSearch query based on the filter options
    let awsOpensearchQuery: Search_RequestBody = {
      query: {
        bool: {
          must: [
            {
              terms: {
                "id.keyword": jobIds,
              },
            }, // Uses an array directly
          ],
        },
      },
      size: jobIds.length,
    };

    global.logger.debug(`aws opensearch query for list of job ids.`, {
      awsOpensearchQuery,
      methodName: this.getAllJobsByJobIdsWithouPagination.name,
    });

    return invokeVpcLambdaOpenSearchUtilObj.executeOperation<
      {
        awsOpensearchQuery: Search_RequestBody
      },
      DbJobAwsOpensearchDto[]
    >(
      this.IndexName,
      {
        awsOpensearchQuery
      },
      OpenSearchOperationsEnum.GET_ALL_DOCUMENTS_WITHOUT_PAGINATION,
      "Get list jobs by given job ids without pagination.",
      this.getAllJobsByJobIdsWithouPagination.name
    );
  }
}

const jobDaoObj = new JobDao();
export { jobDaoObj, JobDao };