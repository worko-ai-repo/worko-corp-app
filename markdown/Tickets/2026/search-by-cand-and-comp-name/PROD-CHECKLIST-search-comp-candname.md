
# Pre-Production checklist
1. Create below composite indexes in `centralCandidateProfiles` in `worko-corp-db-prod` database in firestore
```sh
# All must be in descending order
 candidateProfileInCompaniesList + createdAt
 refereeType + candidateProfileInCompaniesList + createdAt
```

# Deployments
1. `worko-corp-app`, `worko-job-app`, `worko-api`
2. ui deployment
