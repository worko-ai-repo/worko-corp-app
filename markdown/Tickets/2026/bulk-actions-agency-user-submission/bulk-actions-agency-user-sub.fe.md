

1. Bulk find match score
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-user-submission/find-matching-score/bulk`
```json
// Request payload
{
   "agencyUserSubmissionIds": [""]
}
```
```json
{ "message": "Bulk matching score processing initiated." }
```

2. Bulk Move to applicant
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-user-submission/move-to-applicant/bulk`
```json
// Request payload
{
   "agencyUserSubmissions": [
      {
         "agencyUserSubmissionId": "01KFNE9KYHVK0XP1JZMHQ5KGR1",
         "companyName": "NELLSYS",
         "jobTitle": "backend developer"
      }
   ],
}
```
```json
// Response for successfull bulk move to applications
// 202 status code
{
   "message": "Bulk Move to applicant process initiated successfully."
}
```




3. Bulk reject applicants
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



4. Bulk Send for evaluation
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-user-submission/send-for-evaluation/bulk`
```json
// Request payload
{
   "agencyUserSubmissions": [
      {
         "agencyUserSubmissionId": "01KFNE9KYHVK0XP1JZMHQ5KGR1",
         "companyName": "NELLSYS",
         "jobTitle": "backend developer"
      }
   ],
}
```
```json
// Response 
// 202 status code
{
   "message": "Bulk Send for evaluation process initiated successfully."
}
```