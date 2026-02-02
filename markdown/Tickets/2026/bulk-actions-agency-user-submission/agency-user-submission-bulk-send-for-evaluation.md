
1. Bulk Move to applicant
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