// Import cognito related types
import {
  // Client
  CognitoIdentityProviderClient,
  CognitoIdentityProviderClientConfig,

  // Commands
  AdminGetUserCommand,

  // Command outputs
  AdminGetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * AwsClientCognitoIdentityProviderLibrary
 */
class AwsClientCognitoIdentityProviderLibrary {
  /**
   * Checks if the environment variables required to create the AWS client Cognito Identity Provider
   * are set. If not, logs an error and throws a BaseError with a 500 status code.
   * @throws {BaseError} If environment variables are missing
   */
  constructor() {
    if (!process.env.APP_SLS_REGION) {
      global.logger.error(
        "Missing required environment variables for Cognito Identity Provider client.[LIBRARY]",
        {
          region: process.env.APP_SLS_REGION,
          methodName: this.constructor.name,
        }
      );
      throw new BaseError(
        "Missing required environment variables for Cognito Identity Provider client.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }
  }

  /**
   * initClientCognitoIdentityProviderArguments
   *
   * Creates the configuration object for the Cognito Identity Provider client.
   *
   * @returns {CognitoIdentityProviderClientConfig} The configuration object for the Cognito Identity Provider client.
   */
  initClientCognitoIdentityProviderArguments(): CognitoIdentityProviderClientConfig {
    let config: CognitoIdentityProviderClientConfig;

    config = {
      region: process.env.APP_SLS_REGION,
    };

    return config;
  }

  client = new CognitoIdentityProviderClient(
    this.initClientCognitoIdentityProviderArguments()
  );

  /**
   * getUserDetails
   *
   * Retrieves a user's details from AWS Cognito.
   *
   * This method logs the action of retrieving a user's details and constructs
   * an `AdminGetUserCommand` to execute the operation. It sends the command
   * through the Cognito client and logs the success or failure of the
   * operation. It throws an error if the operation fails.
   *
   * @param {string} userPoolId - The ID of the Cognito User Pool.
   * @param {string} userName - The username of the user to be retrieved.
   * @returns {Promise<AdminGetUserCommandOutput>} A promise that resolves
   * to the result of the get user operation.
   * @throws {BaseError} If the user cannot be retrieved.
   */
  async getUserDetails(
    userPoolId: string,
    userName: string
  ): Promise<AdminGetUserCommandOutput> {
    try {
      global.logger.info("Getting user details from Cognito. [LIBRARY]", {
        methodName: this.getUserDetails.name,
        userPoolId,
        userName,
      });

      const command: AdminGetUserCommand = new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: userName,
      });

      return this.client.send(command);
    } catch (error) {
      global.logger.error(
        "Error caught while getting user details. [LIBRARY]",
        {
          methodName: this.getUserDetails.name,
          error: error,
          userPoolId: userPoolId,
          userName: userName,
        }
      );

      throw new BaseError(
        "Unable to get user details from cognito.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }
  }
}

// Export the instance and the class
export { AwsClientCognitoIdentityProviderLibrary };
