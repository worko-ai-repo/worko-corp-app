
1. 
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/candidate-parsed-cv/duplicate-job-appl/bulk`
```json
// Request body
{
   "jobId": "01K99Y76EVQ0K5ZA8HYHZEA70N",
   "applicantEmails": ["ranganayaki.r+72@worko.ai"]
}
```
```json
// Response for duplicate job applications
// 202 status code
{
   "data": [
      {
         "PK": "USR#EML#ranganayaki.r+72@worko.ai"
      }
   ],
   "count": 1,
   "timesQueried": 6,
   "queriedCount": 0
}
```

2. Bulk Move to applicant
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/candidate-parsed-cv/move-to-applicant/bulk`
```json
// Request payload
{
   "candidateParsedCvs": [
      {
         "candidateParsedCvId": "01KFNE9KYHVK0XP1JZMHQ5KGR1",
         "currentCTC": 16,
         "expectedCTC": 19,
         "noticePeriod": 10
      }
   ],
   "companyName": "NELLSYS",
   "jobTitle": "backend developer"
}
```
```json
// Response for successfull bulk move to applications
// 202 status code
{
   "message": "Bulk Move to applicant process initiated successfully."
}
```