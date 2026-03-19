// Import cognito related types
import {
  // Client
  CognitoIdentityProviderClient,
  CognitoIdentityProviderClientConfig,

  // Commands
  AdminGetUserCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,

  // Command outputs
  AdminGetUserCommandOutput,
  AdminCreateUserCommandOutput,
  AdminSetUserPasswordCommandOutput,

  // Types
  MessageActionType,
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

  async setUserPassword(
    userPoolId: string,
    username: string,
    newTemporaryPassword: string,
    permanent: boolean
  ): Promise<AdminSetUserPasswordCommandOutput> {
    try {
      global.logger.info("Resetting temporary password for existing user. [LIBRARY]", {
        methodName: this.setUserPassword.name,
        userPoolId,
        username,
      });

      const command = new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: username,
        Password: newTemporaryPassword,
        Permanent: permanent, 
      });

      return this.client.send(command);
    } catch (error) {
      global.logger.error("Error caught while resetting password. [LIBRARY]", {
        methodName: this.setUserPassword.name,
        error: error,
        username,
      });

      throw new BaseError(
        "Unable to reset user password in cognito.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }
  }

  async createUser(
    userPoolId: string,
    username: string, // "rohithappala999+cand3@gmail.com"
    temporaryPassword: string,

    /*
    [
      { Name: "name", Value: "Rohith Appala" },
      { Name: "phone_number", Value: "+919666308100" }
    ],
    */
    userAttributes: { Name: string; Value: string }[],

    messageAction?: MessageActionType // "SUPPRESS" or "RESEND"
  ): Promise<AdminCreateUserCommandOutput> {
    try {
      global.logger.info("Creating user in Cognito. [LIBRARY]", {
        methodName: this.createUser.name,
        userPoolId,
        username,
      });

      const command: AdminCreateUserCommand = new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: username,
        TemporaryPassword: temporaryPassword,
        UserAttributes: userAttributes,
        MessageAction: messageAction,
      });

      /*
      // Sample Response:
      {
        "$metadata": {
            "httpStatusCode": 200,
            "requestId": "0b37200a-1639-4d69-9f6a-36240ba27e1e",
            "attempts": 1,
            "totalRetryDelay": 0
        },
        "User": {
            "Attributes": [
                {
                    "Name": "email",
                    "Value": "rohithappala999+cand3@gmail.com"
                },
                {
                    "Name": "phone_number",
                    "Value": "+919666308100"
                },
                {
                    "Name": "name",
                    "Value": "Rohith Appala"
                },
                {
                    "Name": "sub",
                    "Value": "11239dfa-7051-7013-2dde-d270accd3094"
                }
            ],
            "Enabled": true,
            "UserCreateDate": "2025-12-03T06:32:23.290Z",
            "UserLastModifiedDate": "2025-12-03T06:32:23.290Z",

            // Force Change Password
            // The user account is confirmed and the user can sign in using a temporary password, but on first sign-in, the user must change their password to a new value before doing anything else.
            // User accounts that are created by an administrator or developer start in this state.
            "UserStatus": "FORCE_CHANGE_PASSWORD",

            "Username": "11239dfa-7051-7013-2dde-d270accd3094"
        }
      }
      */
      /*
      {
        "errorCode": 500,
        "errorMsg": "PreSignUp failed with error A user with this email already exists.",
        "timeStamp": "2025-12-03T06:36:01.307Z"
      }
     */
      return this.client.send(command);
    } catch (error) {
      global.logger.error(
        "Error caught while creating user. [LIBRARY]",
        {
          methodName: this.createUser.name,
          error: error,
          userPoolId: userPoolId,
          username: username,
        }
      );

      throw new BaseError(
        "Unable to create user in cognito.",
        HttpStatusCode.INTERNAL_SERVER_ERROR_500
      );
    }
  }

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
