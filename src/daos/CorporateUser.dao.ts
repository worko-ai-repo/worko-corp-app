// Import QueryResponse
import { Query, QueryResponse } from "dynamoose/dist/ItemRetriever";

// Convert UUID to ULID
import { uuidToULID } from "ulidx";

// Import DTOs
import {
  CorporateUserCreateDto,
  CorporateUserUpdateDto,
} from "../dtos/CorporateUser.dto";

// Import daos
import BaseDao from "./BaseAwsDynamodb.dao";

// Import Models
import {
  CorporateUserModel,
  DbCorporateUserDto,
} from "../db/aws-dynamodb-models/CorporateUser.model";

/**
 * CorporateUserDao
 *
 * This is the DAO class for the Corporate User
 *
 * @implements {BaseDao} - The BaseDao Interface
 */
class CorporateUserDao implements BaseDao {
  // Declareing the BaseDao as a property
  modelName: string = "CorporateUser";
  partitianKey: string = "COMP#ID#{companyId}";
  sortKeys: { SK_INIT: string } = { SK_INIT: "CORP#USR#REG#{email}#ID#{id}" };
  GSI1PK: string = "CORP#USR#REG#";
  GSI1SK = "ID#{id}";

  /**
   * getUserByCompanyIdAndUserEmail
   *
   * Get the details of a Corporate User
   *
   * @param {string} email - The email of the Corporate User
   * @param {string} companyId - The company id of the Corporate User
   *
   * @returns {Promise<QueryResponse<DbCorporateUserDto>>} - The details of the Corporate User
   */
  async getUserByCompanyIdAndUserEmail(
    email: string,
    companyId: string
  ): Promise<QueryResponse<DbCorporateUserDto>> {
    // log the details
    global.logger.info("Getting the details of a Corporate User [DAO]", {
      filePath: __filename,
      methodName: this.getUserByCompanyIdAndUserEmail.name,
    });

    // prepare sort Key
    const SK: { SK_INIT: string } = { SK_INIT: "CORP#USR#REG#{email}#ID#" };

    // return the details of the Corporate User
    return CorporateUserModel.query("PK")
      .eq(this.partitianKey.strtr({ "{companyId}": companyId }))
      .where("SK")
      .beginsWith(SK.SK_INIT.strtr({ "{email}": email }))
      .exec();
  }

  /**
   * getById
   *
   * Get the details of a Corporate User by Id
   *
   * @param {string} userId - The id of the Corporate User
   *
   * @return {Promise<QueryResponse<DbCorporateUserDto>>} - The details of the Corporate User
   */
  async getById(userId: string): Promise<QueryResponse<DbCorporateUserDto>> {
    global.logger.info("Getting the details of a Corporate User by Id [DAO]", {
      filePath: __filename,
      methodName: this.getById.name,
    });

    // return the details of the Corporate User
    return CorporateUserModel.query("GSI1PK")
      .eq(this.GSI1PK)
      .where("GSI1SK")
      .eq(this.GSI1SK.strtr({ "{id}": userId }))
      .exec();
  }

  /**
   * createCorporateUser
   *
   * Create a new Corporate User
   *
   * @param {CorporateUserCreateDto} userDetails - The details of the Corporate User to be created
   *
   * @returns {Promise<DbCorporateUserDto>} - The details of the Corporate User that was created
   */
  async createCorporateUser(
    userDetails: CorporateUserCreateDto,
    cvDuplicacyAccess?: boolean
  ): Promise<DbCorporateUserDto> {
    global.logger.info("Creating a new Corporate User [DAO]", {
      filePath: __filename,
      methodName: this.createCorporateUser.name,
      cognitoUserId: userDetails.cognitoUserId,
      email: userDetails.email,
      companyId: userDetails.companyId,
    });

    // Convert the UUID to ULID
    let userIdInUlid: string = uuidToULID(userDetails.cognitoUserId);

    // Create a new Corporate User
    const fullUserdetails = {
      ...userDetails,
      cvDuplicacyAccess,
      PK: this.partitianKey.strtr({
        "{companyId}": userDetails.companyId,
      }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{email}": userDetails.email,
        "{id}": userIdInUlid,
      }),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{id}": userIdInUlid,
      }),
      id: userIdInUlid,
    };

    // This will create a user with the details provided for the corporate.
    return CorporateUserModel.create(fullUserdetails);
  }

  /**
   * updateCorpUserById
   *
   * Updates the details of a Corporate User in the database.
   *
   * @param {CorporateUserUpdateDto} userDetails - The DTO containing the updated details of the Corporate User.
   * @param {string} userId - The unique identifier of the Corporate User to be updated.
   *
   * @returns {Promise<DbCorporateUserDto>} - A promise that resolves to the updated Corporate User details.
   */
  async updateCorpUserById(
    userDetails: CorporateUserUpdateDto,
    userId: string
  ): Promise<DbCorporateUserDto> {
    global.logger.info("Updating the details of a Corporate User [DAO]", {
      filePath: __filename,
      methodName: this.updateCorpUserById.name,
    });
    // Construct the keys
    const keys = {
      PK: this.partitianKey.strtr({ "{companyId}": userDetails.companyId }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{email}": userDetails.email,
        "{id}": userId,
      }),
    };

    // Destruct the details that need to be updated
    const { email, companyId, ...updateObject } = userDetails;

    // Update the details of the Corporate User
    return CorporateUserModel.update(keys, updateObject);
  }

  /**
   * deleteCorpUserById
   *
   * Delete a Corporate User
   *
   * @param {string} userId - The id of the Corporate User to be deleted
   * @param {CorporateUserUpdateDto} - The details of the Corporate User that was deleted
   */
  async deleteCorpUserById(
    userDetails: CorporateUserUpdateDto,
    userId: string
  ): Promise<DbCorporateUserDto> {
    global.logger.info("Deleting a Corporate User [DAO]", {
      filePath: __filename,
      methodName: this.deleteCorpUserById.name,
    });

    // Construct the keys
    const keys = {
      PK: this.partitianKey.strtr({ "{companyId}": userDetails.companyId }),
      SK: this.sortKeys.SK_INIT.strtr({
        "{email}": userDetails.email,
        "{id}": userId,
      }),
    };

    // Delete the Corporate User
    return CorporateUserModel.update(keys, {
      isDeleted: true,
      deletedByUserId: userDetails.deletedByUserId,
      deletedByCorporateUserId: userDetails.deletedByCorporateUserId,
    });
  }

  /**
   * scriptUpdateSkForCorporateUsers
   *
   * This method updates the sort key and gsipk of all the Corporate Users in the database.
   *
   * @param {DbCorporateUserDto[]} oldCorporateUsers - The list of Corporate Users to be updated.
   * @returns {Promise<boolean>} A promise that resolves to a boolean value indicating whether the update was successful or not.
   */
  async scriptUpdateSkForCorporateUsers(
    oldCorporateUsers: DbCorporateUserDto[]
  ): Promise<boolean> {
    global.logger.info("update sk for corporate users [DAO]", {
      filePath: __filename,
      methodName: this.scriptUpdateSkForCorporateUsers.name,
      countOfOldCorporateUsers: oldCorporateUsers.length,
    });

    if (!oldCorporateUsers.length) {
      return true;
    }

    /**
     * 1. Loop through the list of Corporate Users
     * 2. Create a new Corporate User with New SK, New GSI1PK
     * 3. And then Delete the old Corporate User
     *
     * NOTE: partition key and sort key are together called as composite primary key
     *
     * @param {DbCorporateUserDto} oldCorporateUser
     */
    oldCorporateUsers.forEach(async (oldCorporateUser: DbCorporateUserDto) => {
      // prepare the argument to create a new Corporate User with new SK and GSI1SK
      const corporateUserWithNewCompositePrimaryKeyItem = {
        ...oldCorporateUser,

        /**
         * Old SK:- CORP#USR#{email}#ID#{ID}
         * New SK:- CORP#USR#REG#{email}#ID#{id}
         */
        SK: this.sortKeys.SK_INIT.strtr({
          "{email}": oldCorporateUser.email,
          "{id}": oldCorporateUser.id,
        }),

        /**
         * Old GSI1PK:- CORP#USR#
         * New GSI1PK:- CORP#USR#REG#
         */
        GSI1PK: this.GSI1PK,
      };

      // Create a new Corporate User with New SK and New GSI1SK
      const corporateUserWithNewCompositePrimaryKey =
        await CorporateUserModel.create(
          corporateUserWithNewCompositePrimaryKeyItem
        );
      global.logger.debug(`New Corporate User created [DAO]`, {
        filePath: __filename,
        methodName: this.scriptUpdateSkForCorporateUsers.name,

        oldCorporateUserSK: oldCorporateUser.SK,
        newCorporateUserSK: corporateUserWithNewCompositePrimaryKey.SK,

        oldCorporateUserGSI1PK: oldCorporateUser.GSI1PK,
        newCorporateUserGSI1PK: corporateUserWithNewCompositePrimaryKey.GSI1PK,
      });

      /**
       * Delete the old Corporate User
       *
       * @see https://dynamoosejs.com/guide/Item#itemdeletecallback
       */
      await oldCorporateUser.delete();
      global.logger.debug(`Deleted Old Item`, {
        filePath: __filename,
        methodName: this.scriptUpdateSkForCorporateUsers.name,
        deletedOldItemPK: oldCorporateUser.PK,
        deletedOldItemSK: oldCorporateUser.SK,
      });
    });

    return true;
  }
}

// Creating a new instance of the CorporateUserDao class
const corporateUserDaoObj = new CorporateUserDao();

// Exporting the CorporateUserDao class
export { corporateUserDaoObj, CorporateUserDao };
