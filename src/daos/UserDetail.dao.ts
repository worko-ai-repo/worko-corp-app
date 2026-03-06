// Import dynamoose library
import { QueryResponse } from "dynamoose/dist/ItemRetriever";

//Load the base dao
import BaseDao from "./BaseAwsDynamodb.dao";

//Load the local model
import {
  DbUserDetailDto,
  UserDetailModel,
} from "../db/aws-dynamodb-models/UserDetail.model";

//Load the local dtos
import {
  NewUserCandSignUpDTO,
  NewUserEmpSignUpDTO,
  UserSubscriptionDetailsUpdateDto,
} from "../dtos/User.dto";
import { UserDetailCreateDto, UserDetailDTO } from "../dtos/UserDetail.dto";

// UserDetailDao class implementing the BaseDao interface
class UserDetailDao implements BaseDao {
  modelName: string = "UserDetail";
  partitianKey: string = "USR#EML#{primaryEmail}"; // Partition key structure for user emails
  sortKeys = {
    SK_ID: "ID#{userId}", // where userId is cognito provided userId for registered user
  };
  GSI1PK: string = "USR#";
  GSI1SK: string = "ID#{userId}"; // where userId is cognito provided userId for registered user
  GSI2PK: string = "USR#";

  /**
   * GSI2SK
   * const isoString = new Date().toISOString(); //[LOG]: "2025-06-11T16:15:36.0678Z"
   */
  GSI2SK: string = "{createdAt}";

  /**
   * get
   *
   * Retrieves user details based on the provided email.
   *
   * @param {string} email - Email of the user
   * @returns {Promise<QueryResponse<DbUserDetailDto>>} A promise that resolves with the query response containing the user's details.
   */
  async get(email: string): Promise<QueryResponse<DbUserDetailDto>> {
    global.logger.info("Get user detail by email [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    return UserDetailModel.query("PK")
      .eq(PK)
      .where("SK")
      .beginsWith(this.sortKeys.SK_ID.strtr({ "{userId}": "" }))
      .exec();
  }

  /**
   * getUserById
   *
   * Fetches user details based on the provided email.
   * @param userId - userId  of the user
   * @returns User details corresponding to the email
   */
  async getUserById(userId: string) {
    global.logger.info("Get user getByUserId id [DAO]");
    const GSI1PK = this.GSI1PK;
    const GSI1SK = this.GSI1SK.strtr({
      "{userId}": userId,
    });
    // return UserDetailModel.get({ GSI1PK: GSI1PK, GSI1SK: GSI1SK })
    return UserDetailModel.query("GSI1PK")
      .eq(GSI1PK)
      .where("GSI1SK")
      .eq(GSI1SK)
      .exec();
  }

  /**
   * Fetches user details based on the provided email.
   * @param email - Email address of the user
   * @returns User details corresponding to the email
   */
  async getUserDetails(email: string, SK: string) {
    global.logger.info("Get user detail by id [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });
    return UserDetailModel.query("PK").eq(PK).where("SK").eq(SK).exec();
  }

  async createUserDetail(
    userSignUpDTO: UserDetailCreateDto
  ): Promise<DbUserDetailDto> {
    global.logger.info("Create user detail [DAO]", {
      methodName: this.createUserDetail.name,
    });

    const newUserSignUpDTO = {
      ...userSignUpDTO,
      PK: this.partitianKey.strtr({
        "{primaryEmail}": userSignUpDTO.email,
      }),
      SK: this.sortKeys.SK_ID.strtr({
        "{userId}": userSignUpDTO.id,
      }),
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK.strtr({
        "{userId}": userSignUpDTO.id,
      }),
      GSI2PK: this.GSI2PK,
      GSI2SK: new Date().toISOString(), // Sample value: "2025-06-11T16:15:36.0678Z"
    };
    
    return UserDetailModel.create(newUserSignUpDTO);
  }

  /**
   *
   * @param email
   * @returns
   */
  async update(
    email: string,
    SK: string,
    userDetailDTO: Partial<UserDetailDTO>
  ) {
    global.logger.info("Update user Detail [DAO]");
    const PK = this.partitianKey.strtr({
      "{primaryEmail}": email,
    });

    return UserDetailModel.update({ PK: PK, SK: SK }, userDetailDTO);
  }
}

// Create an instance of the UserDetailDao
const userDetailDao = new UserDetailDao();

// Export the instance for use in other modules
export default userDetailDao;
