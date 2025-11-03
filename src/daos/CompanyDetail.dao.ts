// Import necessary types from dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

//Load the base dao
import BaseDao from "./BaseAwsDynamodb.dao";

//Load the local models
import {
  CompanyDetailModel,
  DbCompanyDetailDto,
} from "../db/aws-dynamodb-models/CompanyDetail.model";

// DAO class for handling Company details
class CompanyDetailDao implements BaseDao {
  modelName = "Company"; // Model name for Company
  partitianKey = "COMP#"; // Partition key for Company
  sortKeys = { SK_INIT: "ID#{companyId}" }; // Sort keys for Company

  // @todo : As we have supporting multiple industries for companies considering the same
  // attaching indutsry to GSI1PK will not work we need to update teh GSI1PK value appropiately
  GSI1PK = "COMP#INDS#{industryName}";
  GSI1SK = "ID#{companyId}";

  /**
   * getCompanyDetailById
   *
   * Retrieves company details based on the provided company ID.
   *
   * @param {string} companyId - The ID of the company to retrieve company details.
   * @return {Promise<QueryResponse<DbCompanyDetailDto>>} A promise that resolves with the query response containing the company details.
   */
  async getCompanyDetailById(
    companyId: string
  ): Promise<QueryResponse<DbCompanyDetailDto>> {
    // Log the action of fetching company details in the dao
    global.logger.info("company details [dao]");

    // replace the placeholders in the sort keys
    const SK = this.sortKeys.SK_INIT.strtr({
      "{companyId}": companyId,
    });

    // return the query response from the model to get the company details
    return CompanyDetailModel.query("PK")
      .eq(this.partitianKey)
      .where("SK")
      .eq(SK)
      .exec();
  }
}

// Export an instance of the CompanyDetailDao class
const companyDetailDao = new CompanyDetailDao();

export default companyDetailDao;
