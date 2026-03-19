
# Pre deployment checklist
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

# Deployments
1.  `worko-corp-app` repo
2. `worko-api` repo
3. `worko-auth` aws lambda
4. Ai lambdas to deploy - check with ai team
   1. `worko-cand-profile-parser-dev`
   2. `worko-bulk-jd-resume-matching-dev` 
