

1. Aws s3 path
`Amazon S3 > Buckets > worko-app-{environment}/candidate-submit-cvs/companies/{companyId}/jobs/{jobId}/cvs/<ulidId>.pdf`

2. Invoked Lambdas
worko-resume-parser-dev -> on dev environment
worko-resume-parser-prod -> on prod environment

3. Payload recieved to `worko-resume-parser-dev`
```json
{
   "companyId": "RJCYFGVJHBRDFCYG",
   "jobId": "REHZDXGFCFCMGVB",
   "candidateParsedCvAwsS3FileName": "XYXY4Y.pdf",
   "cvAwsS3ResourceType": "CAND_SUBMIT_CV_JOB"
}
```