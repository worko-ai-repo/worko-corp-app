
```sh
# NOTE: Follow below checklist only if "Aws SAM with esubuild: Bule-green deployment" testing is successfully 
```

## Pre-deployment Checklist
1. add `Cross-origin resource sharing (CORS)` for `worko-corporate-referral-source-cv-prod` s3 bucket
```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "HEAD"
        ],
        "AllowedOrigins": [
            "https://worko.ai",
            "https://agency.worko.ai"
        ],
        "ExposeHeaders": [
            "Content-Length",
            "Content-Range"
        ]
    }
]
```
2. delete `cloudstack`

## Deployments
1. `feature/aws-sam-template-esbuild` of `worko-corp-app` repository
2. `feature/aws-sam-esbuild-api` of `worko-api` repository
3. `feature/aws-sam-esbuild-job-app` of `worko-job-app` repository
4. `feature/aws-sam-esbuild-chat-app` of `worko-chat-app` repository
5. `worko-api-cognito-pre-signup-trigger` aws lambda 
`worko-auth` aws lambda
6. Ai lambdas to deploy for `edit profile upload cv feature` - check with ai team
   1. `worko-cand-profile-parser-dev`
   2. `worko-bulk-jd-resume-matching-dev` 
7. ai deployment require for `send email csv` file for `large cvs` and `incorrect file name cvs` - check with ai team

# Post deployment checklist
1. Remove `v*` suffix lamba trigger from below `AWS SQS` 
   1. `worko-app-event-queue`
   2. `worko-job-app-event-queue`
   3. `worko-corp-app-event-queue`