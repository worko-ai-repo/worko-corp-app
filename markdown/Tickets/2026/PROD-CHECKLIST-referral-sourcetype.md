
1. Create `worko-referral-email-prod` s3 bucket
2. Create `referral-sourcetype` folder in `worko-referral-email-prod` s3 bucket
3. Add Below `Bucket policy` in `worko-referral-email-prod` s3 bucket
```json
{
   "Version": "2012-10-17",
   "Statement": [
      {
         "Sid": "AllowSESPuts",
         "Effect": "Allow",
         "Principal": {
               "Service": "ses.amazonaws.com"
         },
         "Action": "s3:PutObject",
         "Resource": "arn:aws:s3:::worko-referral-email-prod/referral-sourcetype/*",
         "Condition": {
               "StringEquals": {
                  "aws:Referer": "211125595046"
               }
         }
      }
   ]
}
```
4. In `Amazon SES > Configuration > Email receiving` create configuration as same as `dev` aws
5. Create `referralSourceTypeActivations` collection in `worko-corp-db-prod` database
6. Create `worko-corporate-referral-source-cv-prod` s3 bucket
7. Add Cross-origin resource sharing (CORS) in `worko-corporate-referral-source-cv-prod` s3 bucket
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
            "https://worko.ai"
        ],
        "ExposeHeaders": [
            "Content-Length",
            "Content-Range"
        ]
    }
]
```
8. Check whether `worko-corp-app-event-queue` in sqs is created or not

# Deployments
1. `worko-auth` aws lambda
2. `dev` branch of `worko-api`
3. `dev` branch of `worko-corp-app` 
4. Lambda name: `worko-referral-source-cand-profile-parser-dev` check with `ai team`
   1. S3 Triggers: `worko-referral-source-cand-profile-parser-dev` 
