

# Pre-deployment Checklist
1. Create `CAND_COOLING_PERIOD_END_NOTIFICATION` -> Inform backend developer to create it 
2. 

# Deployments
1. `worko-auth` aws lambda
2. take a pull, populate `.env.prod` to `.env`, deploy `dev` branch of `worko-corp-app` repository
3. take a pull, populate `.env.prod` to `.env`, deploy `dev` branch of `worko-job-app` repository
4. take a pull, populate `.env.prod` to `.env`, deploy `dev` branch of `worko-api` repository


# Features In This Deployment
1. Edit profile in `My database` page of `admin` and `corporate` dashboard
2. `Blacklisted`, `Undercooling period`, listing in `corporate dash`
3. `Blacklisted`, `Undercooling period` activities on job application
4. `Cooling period companies` column in `admin` dashboard
