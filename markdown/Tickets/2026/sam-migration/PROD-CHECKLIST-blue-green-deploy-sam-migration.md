
# Aws SAM with esubuild: Bule-green deployment

## Pre-Deployment checklist
1. discuss about razorpay credentials with cto because we didnt have `prod` razorpay credentials
2. update `Default visibility timeout` to `1000` seconds in below `Amazon SQS > Queues:`
   1. `worko-app-event-queue`
   2. `worko-job-app-event-queue`
   3. `worko-corp-app-event-queue`
3. Update `CAND_JOBS_RECOMMENDATION` email template
4. Amazon Cognito > User pools > worko >Authentication methods > Edit password policy > Custom > Temporary passwords set by administrators expire in `30` days

## Deployments
1. `feature/aws-sam-template-esbuild` of `worko-corp-app` repository
2. `feature/aws-sam-esbuild-api` of `worko-api` repository
3. `feature/aws-sam-esbuild-job-app` of `worko-job-app` repository
4. `feature/aws-sam-esbuild-chat-app` of `worko-chat-app` repository

## Post-Deployment Checklist
1. configure `prod-worko-corp-v9` mapping to `agency-api.worko.ai` custom domain
2. configure `prod-worko-api-v12` mapping to `api.worko.ai` custom domain
3. configure `prod-worko-chat-api-v12` mapping to `chatapi.worko.ai` custom domain
4. configure `prod-worko-chat-api-websockets-v12` mapping to `chatws.worko.ai` custom domain
4. configure `prod-worko-job-app-v10` mapping to `jobs.worko.ai` custom domain
