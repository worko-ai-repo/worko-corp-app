
1. Create User pool with `worko-agency` as same as in `dev` aws 
   1. give `User pool ID`, need to paste in `APP_AWS_AGENCY_COGNITO_USER_POOL_ID` in `.env.prod` in `worko-corp-app` repo
2. Create App client with `worko-password-login` name under `worko-agency` user pool
3. `worko-auth` lambda
   1. Update `Environment variables` as same in `dev` aws 
   2. Copy and paste the `worko-auth` of `dev`
4. Create `prod-worko-corp` REST Api in API Gateway 
   1. Give to `Frontend` they will use in `environment` variables
   2. create a custom domain name for that api
5. Create GCP firestore on `prod`
6. create `GCP-secrect` in `AWS Secrets manager` 
   1. AWS Secrets Manager > Secrets
      1. `GCP-aiplatform-secrect-prod`
         1. Update `APP_AWS_SECRETS_MANAGER_GCP_AI_PLATFORM_ARN_SECRET` in `.env.prod` in `worko-corp-app`, `worko-job-app`,`worko-api` repositories
      2. `GCP-firestore-secret-prod`
         1. Update `APP_AWS_SECRETS_MANAGER_GCP_FIRESTORE_ARN_SECRET` in `.env.prod` in `worko-corp-app`, `worko-job-app`,`worko-api` repositories
7. Create gcp firestore database with `worko-corp-db-prod` as db name
   1. create collection names under these database name:
      1. agencyUsers
      2. agencyJobAssignments
      3. agencyUserInvites
      4. agencyUserSubmissions
      5. candidateParsedCvs
      6. centralCandidateProfiles
      7. corporateCandidateProfiles
   2. Create composite indexes as same as in `dev`
8. Create frontend origin as `https://agency.worko.ai` for `agency dashboard`
9. deploy below ai lambdas by checking with @shaukat
   1. `worko-resume-parser-prod`
   2. `worko-sourcetype-jd-resume-matching-prod`



# Repositories deployments to prod after above check lists finished on `prod`
1. Take a pull from `dev` branch of `worko-corp-app` repository and deploy it
2. Take a pull from `dev` branch of `dev` branch of `worko-job-app` repository and deploy it
3. Take a pull from `dev` branch of `dev` branch of `worko-api` repository and deploy it
