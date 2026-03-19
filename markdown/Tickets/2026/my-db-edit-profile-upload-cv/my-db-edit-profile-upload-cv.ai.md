```sh
In `Metadata` you will recieve `skipParsing: "true"` or "false"
```

1. If cvAwsS3ResourceType="CORP_CAND_BULK_CV_UPLOAD" and "cvAwsS3FilePath": "companies/01JWAQF1G96E0SE9XHXSFGHNWW/bulk-cvs"
   1. `worko-corporate-cand-profile-dev` aws s3 bucket will trigger `worko-cand-profile-parser-dev` aws lambda
2. If cvAwsS3ResourceType="ADMIN_CAND_BULK_CV_UPLOAD" and "cvAwsS3FilePath": "bulk-cvs"
   1. `worko-admin-cand-profile-dev` aws s3 bucket will trigger `worko-cand-profile-parser-dev` aws lambda
3. If  If cvAwsS3ResourceType="BULK_CVS" and "cvAwsS3FilePath": "companies/01K47MSBKS79ACY0BM6Z8VS3F5/bulk-cvs/01KJW4QRC51YK2HRMPDSCPR353"
   1. `worko-corporate-dev` aws s3 bucket will trigger `worko-bulk-jd-resume-matching-dev` 
