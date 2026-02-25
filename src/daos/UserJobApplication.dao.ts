// import dynamoose types
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// import daos
import BaseDao from "./BaseAwsDynamodb.dao";

// Import dtos
import { UserJobApplicationMoveToApplicantCreateDto } from "../dtos/UserJobApplication.dto";

// Import helpers
import { getPaginatedResultsWithMatchingConditions } from "../helpers/dynamoose.helper";

// import models
import {
  DbUserJobApplicationDto,
  UserJobApplicationModel,
} from "../db/aws-dynamodb-models/UserJobApplication.model";

// import services
import UlidService from "../services/Ulid.service";

/**
 * UserJobApplicationDao
 *
 * Dao for handling user job application-related operations
 */
class UserJobApplicationDao implements BaseDao {
  modelName = "UserJobApplication"; // The model name used for user job applications
  partitianKey = "USR#EML#{primaryEmail}"; // Partition key format for user job applications
  sortKeys = { SK_JOB_APP_ID: "JOB#APP#ID#{id}" }; // Sort key format for user job applications
  GSI1PK = "COMP#ID#{companyId}#JOB#APP#"; // `companyID` is the `id` of the company
  GSI1SK = "ID#{id}"; // `id` is the `job application id` which is generated when a job application is created
  GSI2PK = "JOB#APP#";
  GSI2SK = "ID#{id}"; // `id` is the `job application id` which is generated when a job application is created
  GSI3PK = "JOB#ID#{jobId}"; // "jobId" will be the "id" attribute of the internal job
  GSI3SK = "JOB#APP#ID#{id}"; // `id` is the `job application id` which is generated when a job application is created

  /**
   * preparePKAndSKForQuery
   *
   * Prepares the partition key and sort key for a query.
   *
   * @param {string} primaryEmail - The primary email of the user.
   * @param {string} id - The id of the refer and earn.
   *
   * @returns {{PK: string, SK: string}} - An object containing the partition key and sort key.
   */
  preparePKAndSKForQuery(
    primaryEmail: string,
    id: string,
  ): {
    PK: string;
    SK: string;
  } {
    return {
      PK: this.partitianKey.strtr({
        "{primaryEmail}": primaryEmail,
      }),
      SK: this.sortKeys.SK_JOB_APP_ID.strtr({
        "{id}": id,
      }),
    };
  }

  async createJobApplicationMoveToApplicant(
    applicantEmail: string, // This email is need not to be registered in worko
    jobApplicationRequestBody: UserJobApplicationMoveToApplicantCreateDto,
    displayToCorporate?: boolean,
  ) {
    // Generate a unique ID
    const ulidId: string = UlidService.getUlidId();

    // Prepare the data required to create a new job application
    const newJobApplication = {
      ...jobApplicationRequestBody,
      id: ulidId,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": applicantEmail,
      }),
      SK: this.sortKeys.SK_JOB_APP_ID.strtr({
        "{id}": ulidId,
      }),
      GSI1PK: this.GSI1PK.strtr({
        "{companyId}": jobApplicationRequestBody.companyId,
      }),
      GSI1SK: this.GSI1SK.strtr({
        "{id}": ulidId,
      }),
      GSI2PK: this.GSI2PK,
      GSI2SK: this.GSI2SK.strtr({
        "{id}": ulidId,
      }),
      GSI3PK: this.GSI3PK.strtr({
        "{jobId}": jobApplicationRequestBody.jobId,
      }),
      GSI3SK: this.GSI3SK.strtr({
        "{id}": ulidId,
      }),

      /**
       * @description 
       *  1. This attribute will be `true` to display the job application to corporate users
       * even if the matching score is less than the minimum matching threshold, only when `corporates` moved to applicant or for `submit form` feature
       *  2. This attribute will not be set if `worko-admin` moved to applicant(like non-corporate user moving to applicant)
       */
      displayToCorporate,
    };

    // Create the job application in the database
    return UserJobApplicationModel.create(newJobApplication);
  }

  /**
   * getJobApplicationByjobId
   *
   * Retrieves a job application by job ID for a candidate.
   *
   * @param {string} emailId - The email of the user.
   * @param {string} jobId - The job ID.
   * @return {Promise<QueryResponse<DbUserJobApplicationDto>>} A promise that resolves to the job application data.
   */
  async getJobApplicationByjobId(
    emailId: string,
    jobId: string,
  ): Promise<QueryResponse<DbUserJobApplicationDto>> {
    global.logger.info(`Get Job Application By jobId [DAO]`, {
      filePath: __filename,
      methodName: this.getJobApplicationByjobId.name,
      emailId,
      jobId,
    });

    // Generate the PK using the user's email
    let PK: string = this.partitianKey.strtr({ "{primaryEmail}": emailId });

    // Retrieve the job application data from the database and return
    return UserJobApplicationModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith("JOB#APP#ID#")
      .where("jobId")
      .eq(jobId)
      .exec();
  }

  /**
   * getJobApplicationById
   *
   * Retrieves the job application by job application ID.
   *
   * @param {string} jobApplicationId - The job application ID.
   * @returns {Promise<QueryResponse<DbUserJobApplicationDto>>} A promise that resolves to the job application data.
   */
  async getJobApplicationById(
    jobApplicationId: string,
  ): Promise<QueryResponse<DbUserJobApplicationDto>> {
    global.logger.info("Get Job Application By Id [DAO]", {
      filePath: __filename,
      methodName: this.getJobApplicationById.name,
      jobApplicationId,
    });

    // Retrieve the job application data from the database and return
    return UserJobApplicationModel.query("GSI2PK")
      .eq(this.GSI2PK)
      .where("GSI2SK")
      .eq(this.GSI2SK.strtr({ "{id}": jobApplicationId }))
      .exec();
  }

  async getJobApplicationByJobIdAndApplicantEmails(
    jobId: string,
    applicantEmails: string[],
    filterOptions: {
      pageSize: number;
    },
  ) {
    // Initialize the query
    let query: Query<DbUserJobApplicationDto> = UserJobApplicationModel.query("GSI3PK")
        .eq(this.GSI3PK.strtr({ "{jobId}": jobId }))
        .where("GSI3SK")
        .beginsWith(this.GSI3SK.strtr({ "{id}": "" }))
        .where("PK")
        .in(applicantEmails.map((email: string) => this.partitianKey.strtr({ "{primaryEmail}": email })))
        .attributes([
          "PK",
        ]);

    return getPaginatedResultsWithMatchingConditions<
      DbUserJobApplicationDto,
      {
        pageSize: number;
      }
    >(query, filterOptions);
  }

  async updateJobApplicationByIdAndPrimaryEmail(
    jobApplicationId: string,
    applicantUserEmail: string,
    updateData: Partial<DbUserJobApplicationDto>
  ): Promise<DbUserJobApplicationDto> {
    global.logger.info(`Update Job Application details [DAO]`, {
      filePath: __filename,
      methodName: this.updateJobApplicationByIdAndPrimaryEmail.name,
      jobApplicationId,
      applicantUserEmail,
      updateData,
    });

    return UserJobApplicationModel.update(
      this.preparePKAndSKForQuery(applicantUserEmail, jobApplicationId),
      updateData
    );
  }
}

// create an instance of UserJobApplicationDao and export instance object & class
const userJobApplicationDao = new UserJobApplicationDao();
export { userJobApplicationDao, UserJobApplicationDao };
