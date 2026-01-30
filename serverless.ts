/**
 * In place of "serverless.yml" file we are using "serverless.ts" file because we are using typescript language in
 * our entire project but ".yml" extension uses YAML language to define the structure of the Serverless configuration object.
 * To maintain consistency, we are using "serverless.ts" file which uses TypeScript language to define the structure of the
 * Serverless configuration object.
 *
 * To use "serverless.ts" file instead of "serverless.yml" file, we must install below dependencies in devDependencies using the following command:
 * npm install -D @serverless/typescript ts-node
 */

/**
 * Imports the `AWS` type from the `@serverless/typescript` package.
 * This type is used to define the structure of the Serverless configuration object.
 * It helps with TypeScript type checking and ensures that the configuration adheres to the expected format.
 */
import type { AWS } from "@serverless/typescript";

// Import dotenv
import * as dotenv from "dotenv";
dotenv.config();

const serverlessConfiguration: AWS = {
  service: "worko-corp", // Name of the service

  frameworkVersion: "^3.40.0",

  useDotenv: true, // Enables the use of the `.env` file for environment variables.

  package: {
    excludeDevDependencies: true,
  },

  /**
   * Plugins used in the Serverless configuration to enhance the build and deployment process.
   */
  plugins: [
    "serverless-offline", // Enables local testing of the APIs
    "serverless-dotenv-plugin", // Loads environment variables from `.env` files.
    "serverless-webpack", // Optimizes the build process using Webpack for packaging Lambda functions.
  ],

  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      packager: 'npm',
      includeModules: {

        /**
         * @description We are passing the configuration for the serverless-webpack plugin. 
         * You can explicitly exclude and include third party libraries based on your requirement. 
         * Since @aws-sdk v3 is already provided in the lambda environment by AWS , 
         * we don’t need to package it in the build hence it’s been excluded forcefully.
         */
        forceExclude: [
          "@aws-sdk/client-cognito-identity-provider",
          "@aws-sdk/client-lambda",
          "@aws-sdk/client-scheduler",
          "@aws-sdk/client-secrets-manager",
          "@aws-sdk/client-ses",
          "@aws-sdk/client-s3",
          "@aws-sdk/s3-request-presigner",
          "@aws-sdk/lib-storage"
        ]
      }
    },
    app: {
      STAGE: "${env:APP_SLS_STAGE}",
    },

    aws: {
      APP_AWS_ACCOUNT_ID: "${env:APP_AWS_ACCOUNT_ID}",
      APP_AWS_VPC: "${env:APP_AWS_VPC}",
      APP_AWS_SECURITY_GROUP: "${env:APP_AWS_SECURITY_GROUP}",
      APP_AWS_SUBNET1: "${env:APP_AWS_SUBNET1}",
      APP_AWS_SUBNET2: "${env:APP_AWS_SUBNET2}",
      APP_SLS_REGION: "${env:APP_SLS_REGION}",
      APP_AWS_AGENCY_COGNITO_USER_POOL_ID: "${env:APP_AWS_AGENCY_COGNITO_USER_POOL_ID}",
      APP_AWS_WORKO_COGNITO_USER_POOL_ID: "${env:APP_AWS_WORKO_COGNITO_USER_POOL_ID}",
      APP_AWS_SECRETS_MANAGER_GCP_FIRESTORE_ARN_SECRET: "${env:APP_AWS_SECRETS_MANAGER_GCP_FIRESTORE_ARN_SECRET}",
      APP_AWS_SECRETS_MANAGER_GCP_AI_PLATFORM_ARN_SECRET: "${env:APP_AWS_SECRETS_MANAGER_GCP_AI_PLATFORM_ARN_SECRET}",
      APP_AWS_S3_BUCKET_WORKO_CORPORATE: "${env:APP_AWS_S3_BUCKET_WORKO_CORPORATE}",
      APP_AWS_S3_BUCKET_WORKO_APP: "${env:APP_AWS_S3_BUCKET_WORKO_APP}",
      APP_AWS_S3_BUCKET_WORKO_AGENCY_BULK_CVS: "${env:APP_AWS_S3_BUCKET_WORKO_AGENCY_BULK_CVS}",
      APP_AWS_S3_BUCKET_WORKO_CORPORATE_CAND_PROFILE: "${env:APP_AWS_S3_BUCKET_WORKO_CORPORATE_CAND_PROFILE}",
      APP_AWS_S3_BUCKET_WORKO_ADMIN_CAND_PROFILE: "${env:APP_AWS_S3_BUCKET_WORKO_ADMIN_CAND_PROFILE}",
      APP_AWS_S3_BUCKET_WORKO_CORPORATE_REFERRAL_SOURCE_CV: "${env:APP_AWS_S3_BUCKET_WORKO_CORPORATE_REFERRAL_SOURCE_CV}",
    },
    awsLambdaFunctions: {
      APP_AWS_SCHEDULER_HANDLER_LAMBDA_ARN: "arn:aws:lambda:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-corp-${self:custom.app.STAGE}-appScheduler",
      APP_AWS_SCHEDULER_HANDLER_ROLE_ARN: "arn:aws:iam::${self:custom.aws.APP_AWS_ACCOUNT_ID}:role/worko-schedule-invoke-lambda-role",
    },
  },

  provider: {
    name: "aws",

    runtime: "nodejs20.x",

    stage: process.env.APP_SLS_STAGE,

    environment: {
      APP_AWS_SCHEDULER_HANDLER_LAMBDA_ARN: "${self:custom.awsLambdaFunctions.APP_AWS_SCHEDULER_HANDLER_LAMBDA_ARN}",
      APP_AWS_SCHEDULER_HANDLER_ROLE_ARN: "${self:custom.awsLambdaFunctions.APP_AWS_SCHEDULER_HANDLER_ROLE_ARN}",
    },

    /**
     * region
     *
     * The type of `region` is a string literal type,so that's why we are not assigning dynamic value.
     *
     * @type {"ap-south-1" | "us-east-1" | "us-east-2" | "us-gov-east-1" | "us-gov-west-1" | "us-iso-east-1" | "us-iso-west-1" | "us-isob-east-1" | "us-west-1" | "us-west-2" | "af-south-1" | ... 24 more ... | undefined}
     */
    region: "ap-south-1",

    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DescribeTable",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchGetItem",
          "dynamodb:BatchWriteItem",
        ],
        Resource: [
          /**
           * arn:aws:dynamodb:{region}:{account-id}:table/{tablename}
           */

          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko",
          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko/index/GSI1",
          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko/index/GSI2",

          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko-job-app",
          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko-job-app/index/GSI1",
          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko-job-app/index/GSI2",
          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko-job-app/index/GSI3",

          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko-count",
          "arn:aws:dynamodb:${self:custom.aws.APP_SLS_REGION}:*:table/worko-count/index/GSI1",
        ],
      },

      {
        Effect: "Allow",
        Action: [
          "ses:SendEmail",
          "ses:GetContactList",
          "ses:SendCustomVerificationEmail",
          "ses:UpdateContactList",
          "ses:UpdateEmailTemplate",
          "ses:GetEmailIdentityPolicies",
          "ses:GetEmailTemplate",
          "ses:CreateEmailTemplate",
          "ses:SendBulkEmail",
          "ses:GetEmailIdentity",
          "ses:CreateTemplate",
          "ses:UpdateTemplate",
          "ses:GetTemplate",
          "ses:DeleteTemplate",
          "ses:SendTemplatedEmail",
          "ses:CreateTemplate",
        ],
        Resource: "*",
      },

      {
        Effect: "Allow",
        Action: ["s3:PutObject", "s3:GetObject", "s3:ListBucket"],
        Resource: [
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_CORPORATE}",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_CORPORATE}/*",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_APP}",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_APP}/*",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_AGENCY_BULK_CVS}",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_AGENCY_BULK_CVS}/*",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_CORPORATE_CAND_PROFILE}",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_CORPORATE_CAND_PROFILE}/*",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_ADMIN_CAND_PROFILE}",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_ADMIN_CAND_PROFILE}/*",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_CORPORATE_REFERRAL_SOURCE_CV}",
          "arn:aws:s3:::${self:custom.aws.APP_AWS_S3_BUCKET_WORKO_CORPORATE_REFERRAL_SOURCE_CV}/*",
        ],
      },

      {
        Effect: "Allow",
        Action: ["lambda:InvokeFunction", "lambda:InvokeAsync"],
        Resource: [
          "arn:aws:lambda:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-resume-parser-${self:custom.app.STAGE}",
          "arn:aws:lambda:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-job-app-${self:custom.app.STAGE}-app-opensearch-operations",
          "arn:aws:lambda:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-sourcetype-jd-resume-matching-${self:custom.app.STAGE}",
          "arn:aws:lambda:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-corp-${self:custom.app.STAGE}-app-sourcetype-bulk-find-jd-cv-match-score",
          "arn:aws:lambda:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-corp-${self:custom.app.STAGE}-appInvokeLambda",
        ],
      },
      {
        Effect: "Allow",
        Action: [
          "iam:PassRole",
          "scheduler:GetSchedule",
          "scheduler:UpdateSchedule",
          "scheduler:CreateSchedule",
          "scheduler:DeleteSchedule"
        ],
        Resource: [
          "arn:aws:iam::${self:custom.aws.APP_AWS_ACCOUNT_ID}:role/worko-schedule-invoke-lambda-role",
          "arn:aws:scheduler:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:schedule/*/*"
        ]
      },
      {
        Effect: "Allow",
        "Action": [
          "scheduler:GetScheduleGroup",
          "scheduler:DeleteScheduleGroup",
          "scheduler:CreateScheduleGroup"
        ],
        "Resource": "arn:aws:scheduler:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:schedule-group/*"
      },
      {
        Effect : "Allow",
        "Action": [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminCreateUser",
        ],
        "Resource":[
          /**
           * @example "arn:aws:cognito-idp:ap-south-1:211125353899:userpool/ap-south-1_xGreJKkNc"
           */
          "arn:aws:cognito-idp:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:userpool/${self:custom.aws.APP_AWS_WORKO_COGNITO_USER_POOL_ID}",

          /**
           * @example "arn:aws:cognito-idp:ap-south-1:211125353899:userpool/ap-south-1_KB3omxXcw"
           */
          "arn:aws:cognito-idp:ap-south-1:${self:custom.aws.APP_AWS_ACCOUNT_ID}:userpool/${self:custom.aws.APP_AWS_AGENCY_COGNITO_USER_POOL_ID}"
        ]
      },
      {
        "Effect": "Allow",
        "Action": [
            "secretsmanager:GetSecretValue",
        ],
        "Resource":[
          "arn:aws:secretsmanager:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:secret:${self:custom.aws.APP_AWS_SECRETS_MANAGER_GCP_FIRESTORE_ARN_SECRET}",
          "arn:aws:secretsmanager:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:secret:${self:custom.aws.APP_AWS_SECRETS_MANAGER_GCP_AI_PLATFORM_ARN_SECRET}"
        ] 
      },
  
      {
        Effect: "Allow",
        Action: [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ],
        Resource:
          "arn:aws:sqs:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:worko-corp-app-event-queue",
      },
    ],
  },

  functions: {
    /**
     * workoCorp
     *
     * AWS Lambda Function Format:- {service}-{enviroment}-{functionName}
     * Example:
     *  1. `worko-corp-local-workoCorp`
     *  2. `worko-corp-dev-workoCorp`
     *  3. `worko-corp-prod-workoCorp`
     */
    workoCorp: {
      handler: "dist/src/app.handler",
      timeout: 900, // Set timeout to 900 seconds (15 minutes)

      events: [
        {
          http: {
            path: "/{proxy+}",
            method: "ANY",
            cors: {
              origin: "*",
              headers: [
                "Content-Type",
                "X-Amz-Date",
                "Authorization",
                "X-Api-Key",
                "X-Amz-Security-Token",
                "X-Amz-User-Agent",
                "X-Amzn-Trace-Id",
              ],
              allowCredentials: false,
            },
            authorizer: {
              type: "request",
              arn: "arn:aws:lambda:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:function:worko-auth",
            },
          },
        },
      ],
    },

    /**
     * appScheduler
     *
     * AWS Lambda Function Format:- {service}-{enviroment}-{functionName}
     * Example:
     *  1. `worko-corp-local-appScheduler`
     *  2. `worko-corp-dev-appScheduler`
     *  3. `worko-corp-prod-appScheduler`
     */
    appScheduler: {
      handler: "dist/src/app-scheduler.handler",
    },

    /**
     * Event Trigger
     *
     * AWS Lambda Function Format:- {service}-{enviroment}-{functionName}
     * Example:
     *  1. `worko-corp-local-appeventtrigger`
     *  2. `worko-corp-dev-appeventtrigger`
     *  3. `worko-corp-prod-appeventtrigger`
     */
    appeventtrigger:{
      handler: "dist/src/app-event-trigger.handler",
      events: [
        {
          sqs: {
            arn: "arn:aws:sqs:${self:custom.aws.APP_SLS_REGION}:${self:custom.aws.APP_AWS_ACCOUNT_ID}:worko-corp-app-event-queue",
            batchSize: 1,
            maximumBatchingWindow: 0
          }
        }
      ]
    },

    /**
     * appInvokeLambda
     * 
     * @note
     *  1. This lambda function is used for direct lambda to lambda invocations,
     *  like if a lambda needs to invoke a another lambda without any sqs queue,
     *  then in this "worko-corp-app" repository this lambda is used,
     *  for every different kind of use cases if direct lambda to lambda invocation is needed 
     *  then this lambda can be used.
     *
     * AWS Lambda Function Format:- {service}-{enviroment}-{functionName}
     * Example:
     *  1. `worko-corp-local-appInvokeLambda`
     *  2. `worko-corp-dev-appInvokeLambda`
     *  3. `worko-corp-prod-appInvokeLambda`
     */
    appInvokeLambda: {
      handler: "dist/src/app-invoke-lambda.handler",
      timeout: 900, // Set timeout to 900 seconds (15 minutes)
    },
  },
};

module.exports = serverlessConfiguration;
