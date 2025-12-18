
import {
  GetSecretValueCommand,
  GetSecretValueCommandOutput,
  SecretsManagerClient,
  SecretsManagerClientConfig,
} from "@aws-sdk/client-secrets-manager";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

/**
 * AwsClientSecretsManagerLibrary
 */
class AwsClientSecretsManagerLibrary {
  initClientSecretsManagerArguments(): SecretsManagerClientConfig {
    let config: SecretsManagerClientConfig;

    config = {
      region: process.env.APP_SLS_REGION,
    };

    /**
     * @todo: 
     *  1. Need to investigate how to use AWS credentials for local development
     *  2. I configured aws credentials in my local machine and it worked without below code, so need to 
     *    investigate how this code works from local machine.
     */
    // if (APP_CONSTANTS.STAGES.LOCAL === process.env.APP_STAGE) {
    //   if(!process.env.APP_AWS_ACCESS_KEY_ID || !process.env.APP_AWS_SECRET_ACCESS_KEY) {
    //     throw new BaseError("Missing AWS credentials for local development [AWS SECRETS MANAGER LIBRARY]", HttpStatusCode.INTERNAL_SERVER_ERROR_500);
    //   }
    //   config.credentials = {
    //     accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
    //   };
    // }

    return config;
  }

  client = new SecretsManagerClient(
    this.initClientSecretsManagerArguments()
  );

  async getSecret(secretName: string): Promise<GetSecretValueCommandOutput> {
      try {
         let response: GetSecretValueCommandOutput = await this.client.send(
            new GetSecretValueCommand({
               SecretId: secretName,
               VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
         );
         return response;
      } catch (error) {
         global.logger.error("Failed to get secret", { 
            methodName: this.getSecret.name, 
            error 
         });

         // For a list of exceptions thrown, see
         // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
         throw new BaseError(`Failed to get secret`, HttpStatusCode.INTERNAL_SERVER_ERROR_500);
      }
  }

  async getParsedSecret<ParsedSecretStringResponseDto>(secretName: string): Promise<ParsedSecretStringResponseDto> {
      const response: GetSecretValueCommandOutput = await this.getSecret(secretName);
      return JSON.parse(response.SecretString || "");
  }
}

export { AwsClientSecretsManagerLibrary };