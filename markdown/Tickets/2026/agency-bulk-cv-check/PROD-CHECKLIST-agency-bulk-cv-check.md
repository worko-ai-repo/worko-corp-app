
# Follow below order 
1. Create `worko-corp-db-prod` database
2. Create `agencyBulkJds` and `agencyBulkJdResumes` collections in `worko-corp-db-prod` database
3. Create below `composite indexes` all in `descending` order for `agencyBulkJds` collection in `worko-corp-db-prod` database:
```sh
 - agencyRegisteredEmail + createdAt
 - agencyRegisteredEmail + companyId + createdAt
```
4. Create below `composite indexes` all in `descending` order for `agencyBulkJdResumes` collection in `worko-corp-db-prod` database:
```sh
 - agencyRegisteredEmail + agencyBulkJdId + createdAt
```

# Deployments
1. `dev` branch of `worko-corp-app` repository
2. `worko-auth` lambda from `aws console`
3. Check with `ai` team to deploy `worko-agency-bulk-jd-resume-matching-prod` lambda through `IAC`
