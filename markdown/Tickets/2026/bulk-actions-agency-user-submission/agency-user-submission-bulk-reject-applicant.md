

2. Bulk reject applicants
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-user-submission/move-to-applicant/bulk`
```json
// Request payload
{
  "agencyUserSubmissionIds": [
   "XXXX",
  ],
  "rejectApplicantReason": "string",
  "rejectApplicantDetailedReason": "string",
}
```
```json
// Response for successfull bulk move to applications
// 202 status code
{
   "message": "Bulk Applicants rejction initiated successfully."
}
```
