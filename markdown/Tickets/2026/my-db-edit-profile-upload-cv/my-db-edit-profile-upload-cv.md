
1. If cvAwsS3ResourceType="AGENCY_SUBMIT_USER_CV"
  cvAwsS3FilePath: "agencies/21YCYSMG5HE2PMZ0459J0VPCG9/companies/01JWAQF1G96E0SE9XHXSFGHNWW/jobs/01K8SZ21FPB7TD10YQQAJ22KN0/user-profiles"
[POST] `https://agency-api.dev.worko.work/file/gsu2u/AGENCY_SUBMIT_USER_CV`
```json
// Request Body
{
  "agencyUserId":"21YCYSMG5HE2PMZ0459J0VPCG9",
  "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
  "jobId": "01K8SZ21FPB7TD10YQQAJ22KN0",
  "fileName": "raj_cv.pdf",
  "fileMimeType": "application/pdf"
}
```

2. If cvAwsS3ResourceType="CAND_SUBMIT_CV_JOB"
  cvAwsS3FilePath: "candidate-submit-cvs/companies/01JWAQF1G96E0SE9XHXSFGHNWW/jobs/01K9CAPP194FFNV6D876KVG01S/cvs"
[POST] `https://agency-api.dev.worko.work/file/gsu2u/CAND_SUBMIT_CV_JOB`
```json
// Request Body
{
  "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
  "jobId": "01K9CAPP194FFNV6D876KVG01S",
  "fileName": "raj_cv.pdf",
  "fileMimeType": "application/pdf"
}
```

3. If cvAwsS3ResourceType="USER_RESUME"
  "cvAwsS3FilePath": "users/0153edba-7021-70e3-ff74-67835d134550/resumes"
[POST] `https://api.dev.worko.work/file/gsu2u/USER_RESUME`
```json
// Request Body
{
  "userId":"0153edba-7021-70e3-ff74-67835d134550",
  "resumeUserFileName": "raj_cv.pdf",
  "resumeFileMimeType": "application/pdf"
}
```

4. If cvAwsS3ResourceType="BULK_CVS"
  "cvAwsS3FilePath": "companies/01K47MSBKS79ACY0BM6Z8VS3F5/bulk-cvs/01KJW4QRC51YK2HRMPDSCPR353"
[POST] `https://api.dev.worko.work/file/gsu2u/BULK_CVS`
```json
// Request Body
{
  "companyId": "01K47MSBKS79ACY0BM6Z8VS3F5",
  "corporateBulkJdId": "01KJW4QRC51YK2HRMPDSCPR353",
  "fileName": "raj_cv.pdf",
  "fileMimeType": "application/pdf"
}
```

5. If cvAwsS3ResourceType="CORP_CAND_BULK_CV_UPLOAD"
  "cvAwsS3FilePath": "companies/01JWAQF1G96E0SE9XHXSFGHNWW/bulk-cvs"
[POST] `https://agency-api.dev.worko.work/file/gsu2u/CORP_CAND_BULK_CV_UPLOAD`
```json
// Request Body
{
  "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
  "fileName": "raj_cv.pdf",
  "fileMimeType": "application/pdf"
}
```

6. If cvAwsS3ResourceType="CORP_CAND_REFERRAL_CV"
  "cvAwsS3FilePath": "companies/01HZM7MDK1QZCCV7ZD41VGBAVD/referral-source-cvs",
[POST] `https://agency-api.dev.worko.work/file/gsu2u/CORP_CAND_REFERRAL_CV`
```json
// Request Body
{
  "companyId": "01HZM7MDK1QZCCV7ZD41VGBAVD",
  "fileName": "raj_cv.pdf",
  "fileMimeType": "application/pdf"
}
```

7. If cvAwsS3ResourceType="ADMIN_CAND_BULK_CV_UPLOAD"
  "cvAwsS3FilePath": "bulk-cvs"
[POST] `https://agency-api.dev.worko.work/file/gsu2u/ADMIN_CAND_BULK_CV_UPLOAD`
```json
// Request Body
{
  "fileName": "raj_cv.pdf",
  "fileMimeType": "application/pdf"
}
```

8. 
[PATCH] `/candidate-parsed-cv/:id`
```json
{
  // ...
  "cvAwsS3FileName": "54SRDYCGVJHBNDRYTCGVJH.pdf",
  // ...
}
```