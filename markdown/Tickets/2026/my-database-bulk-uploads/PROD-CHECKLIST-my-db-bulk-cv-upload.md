

1. Create `worko-corporate-cand-profile-prod` aws s3 bucket
2. Cross-origin resource sharing (CORS) for `worko-corporate-cand-profile-prod` aws s3 bucket
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
3. Create `worko-admin-cand-profile-prod` aws s3 bucket
4. Cross-origin resource sharing (CORS) for `worko-admin-cand-profile-prod` aws s3 bucket
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
5. create `worko-corp-app-event-queue` in sqs


# Deployments
1. `worko-auth` aws lambda
2. `dev` branch of `worko-corp-app`