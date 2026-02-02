1. Bulk Move to applicant
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