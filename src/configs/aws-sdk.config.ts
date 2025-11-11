// NPM Packages
import AWS from "aws-sdk";

// Import configs
import APP_CONSTANTS from "./constants.config";
import { AwsS3ClientLibrary } from "../libraries/aws-s3-client.library";
import { AwsClientCognitoIdentityProviderLibrary } from "../libraries/aws-client-cognito-identity-provider.library";
import { AwsSesClientLibrary } from "../libraries/aws-ses-client.library";
import { AwsClientLambdaLibrary } from "../libraries/aws-client-lambda.library";

/**
 * awsConfigOptions
 *
 * Generic configurations for the AWS services.
 */
let awsConfigOptions: AWS.ConfigurationOptions = {};

// For the "local" env/stage use the credentials from the environment config,
// and for all other envs/stages the permissions from the lambda function would be used.
if (process.env.APP_STAGE == APP_CONSTANTS.STAGES.LOCAL) {
  awsConfigOptions = {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.APP_AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.APP_AWS_SESSION_TOKEN,
    region: process.env.APP_AWS_REGION,
  };
}

// ****************************************************************************************************
// AWS DynamoDB Client Library
// ****************************************************************************************************

/**
 * awsDynamoDBConfigOptions
 *
 * AWS DynamoDB specific configurations extending the "awsConfigOptions".
 */
const awsDynamoDBConfigOptions: AWS.DynamoDB.ClientConfiguration = {
  ...awsConfigOptions,
};

/**
 * ****************************************************************************************************
 * AWS S3 Client Library
 * ****************************************************************************************************
 */

/**
 * awsS3ConfigOptions
 *
 * AWS S3 specific configurations extending the "awsConfigOptions".
 */
const awsS3ConfigOptions: AWS.S3.ClientConfiguration = {
  ...awsConfigOptions,
  apiVersion: "2023-09-08",
};


/**
 * ****************************************************************************************************
 * AWS SES Client Library
 * ****************************************************************************************************
 */

/**
 * awsSesConfigOptions
 *
 * AWS SES specific configurations extending the "awsConfigOptions".
 */
const awsSesConfigOptions: AWS.SES.ClientConfiguration = {
  ...awsConfigOptions,
  apiVersion: "2010-12-01",
};

/**
 * awsS3ClientLibrary
 *
 * Application/local S3 wrapper client to interact with AWS S3 service to perform regular activities
 */
const awsS3ClientLibrary: AwsS3ClientLibrary = new AwsS3ClientLibrary(
  awsS3ConfigOptions
);
console.log("The 'awsS3ClientLibrary' is initialised.", {
  filePath: __filename,
});

/**
 * awsClientCognitoIdentityProviderLibrary
 * 
 * NOTE: For this client, the `aws-sdk v3` is used
 */
const awsClientCognitoIdentityProviderLibrary: AwsClientCognitoIdentityProviderLibrary = new AwsClientCognitoIdentityProviderLibrary();
global.logger.info(`The "awsClientCognitoIdentityProviderLibrary" is initialised.`);


/**
 * awsSesClientLibrary
 *
 * Application/local SES wrapper client to interact with AWS SES service to perform regular activities
 */
const awsSesClientLibrary: AwsSesClientLibrary = new AwsSesClientLibrary(
  awsSesConfigOptions
);
console.log("The 'awsSesClientLibrary' is initialised.", {
  filePath: __filename,
});

/**
 * awsClientLambdaLibrary
 * 
 * NOTE: For this lambda client, the `aws-sdk v3` is used
 */
const awsClientLambdaLibrary: AwsClientLambdaLibrary = new AwsClientLambdaLibrary();
global.logger.info(`The "awsClientLambdaLibrary" is initialised.`);


// Export the required resourses
export {
  // Configurations
  awsConfigOptions,
  awsDynamoDBConfigOptions,
  awsS3ConfigOptions,
  awsSesConfigOptions,

  // Libraries
  awsS3ClientLibrary,
  awsClientCognitoIdentityProviderLibrary,
  awsSesClientLibrary,
  awsClientLambdaLibrary,
};
