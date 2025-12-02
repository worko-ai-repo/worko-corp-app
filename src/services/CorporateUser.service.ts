// Import dynamoose types
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

// Import daos
import {
  corporateUserDaoObj,
} from "../daos/CorporateUser.dao";


// Import models
import { DbCorporateUserDto } from "../db/aws-dynamodb-models/CorporateUser.model";

// Import Utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CorporateUserService {

  /**
   * getCorpUserById
   *
   * Get a Corporate User by the ID of the User
   *
   * @param {string} userId - The ID of the Corporate User
   *
   * @returns {Promise<QueryResponse<DbCorporateUserDto>>} - The details of the Corporate User that was fetched
   */
  async getCorpUserById(
    userId: string
  ): Promise<QueryResponse<DbCorporateUserDto>> {
    // Logger
    global.logger.info(
      "Processing request to get Corporate User by ID. [SERVICE]",
      {
        filePath: __filename,
        methodName: this.getCorpUserById.name,
      }
    );

    // Get the Corporate User by the ID
    return corporateUserDaoObj.getById(userId);
  }

  /**
   * getCorpUserByIdWithParsing
   *
   * Retrieves the details of a Corporate User by their ID and parses the result.
   *
   * @param {string} userId - The ID of the Corporate User.
   * @throws {BaseError} - If the Corporate User does not exist with the given ID.
   * @returns {Promise<DbCorporateUserDto>} - The details of the Corporate User.
   */
  async getCorpUserByIdWithParsing(
    userId: string
  ): Promise<DbCorporateUserDto> {
    // Get the Corporate User by the ID
    const corporateUserDetails: QueryResponse<DbCorporateUserDto> =
      await this.getCorpUserById(userId);

    // If the user does not exist, throw an error
    if (!corporateUserDetails.count) {
      throw new BaseError(
        `Corporate User does not exist with the given ID: ${userId}`,
        HttpStatusCode.NOT_FOUND_404
      );
    }

    return corporateUserDetails[0];
  }

  async getUserByCompanyIdAndUserEmail(
    email: string,
    companyId: string
  ): Promise<QueryResponse<DbCorporateUserDto>> {
    return corporateUserDaoObj.getUserByCompanyIdAndUserEmail(email, companyId);
  }
}

// Export the CorporateUserService class
const corporateUserServiceObj = new CorporateUserService();

// Export the CorporateUserService class
export { corporateUserServiceObj, CorporateUserService };
