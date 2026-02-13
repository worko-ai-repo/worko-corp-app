

# Pre-deployment Production Checklist
1. Create `bulkSourceTypeResumes` and `bulkSourceTypeParseResumes` collections in `worko-corp-db-prod` database in `Gcp firestore`


# Deployments to Production
1. `worko-auth` lambda from `aws console`
2. `dev` branch of `worko-api` repository
3. `dev` branch of `worko-corp-app` repository
4. Below `ai` lambdas check with `ai` team:
```sh
1. `worko-resume-parser-dev`
2. `worko-bulk-jd-resume-matching`
3. `worko-agency-bulk-jd-resume-matching-dev`
4. `worko-cand-profile-parser-dev`
5. `worko-referral-source-cand-profile-parser-dev`
```

# Features moved to production in this deployment
1. `multipleCandidateExperience` details include in parsing via `AGENCY`, `REFERRAL`, `INTERNAL` source types
2. `Bulk CV upload` duplicate, failed, success counts and candidates names send csv file in emails to `corporate` or `worko-admin` 
3. Candidate Submit form feature
4. `Pause` and `Resume` buttons on `agency invite` list page
5. Single `Refresh Cv` button on `My database` pages on `admin` and `corporate` dashboards
