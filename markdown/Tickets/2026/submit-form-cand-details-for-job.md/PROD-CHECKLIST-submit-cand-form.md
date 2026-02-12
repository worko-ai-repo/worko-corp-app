
1. create below email templates on prod
   1. CAND_DUPLICATE_JOB_APPLICATION_SUBMIT_FORM_FOR_JOB
   2. CAND_SUCCESS_SUBMIT_FORM_FOR_JOB

# Deployments
1. `worko-auth`
2. populate `.env.prod` to `.env`, take a pull and deploy `dev` branch of `worko-corp-app` repository to `prod`
3. deploy ai lambda: `worko-resume-parser-prod` by checking with `ai team`
