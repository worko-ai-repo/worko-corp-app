

1. 
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/file/gsu2u/CAND_SUBMIT_CV_JOB`
```json
// Request body
{
   "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
   "jobId": "01K8TPT1PT2W5DTRSFPWTB92GH",
   "fileName": "cand-one-submit-cv.pdf",
   "fileMimeType": "application/pdf"
}
```
```json
// Response

```

2. 
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/file/gsu2v/CAND_SUBMIT_CV_JOB`
```json
// Request body
{
   "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
   "jobId": "01K8TPT1PT2W5DTRSFPWTB92GH",
   "candidateCvAwsS3FileName": "string"
}
```
```json
// Response
```

3. 
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/candidate-parsed-cv/parse/submit-form`
```json
// Request payload
  companyId: string;
  jobId: string;

  /**
   * /<ulidId>.pdf"
   */
  candidateParsedCvAwsS3FileName: string;
```
```json
```

4. 
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/candidate-parsed-cv/create/submit-form`
```json
// Request payload
{
  companyId: string;
  jobId: string;

  /**
   * /<ulidId>.pdf"
   */
  candidateParsedCvAwsS3FileName: string;
}
```
```json
```

5. 
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/candidate-parsed-cv/move-to-applicant/submit-form`
```json
// Request payload
{
  candidateParsedCvId: string;

  /**
   * jobId
   *
   * @reference `id` attribute of `CompanyJob.model.ts`
   */
  jobId: string;

  /**
   * companyName
   */
  companyName: string;
  jobTitle: string;
}
```
```json
```
