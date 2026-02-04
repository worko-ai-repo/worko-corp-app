


1. Bulk Find match score in `A.T.L.A.S`
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/candidate-parsed-cv/find-matching-score/bulk`
```json
// Request payload
{
  "jobId": "01K99Y76EVQ0K5ZA8HYHZEA70N",
  "candidateParsedCvIds": [
      "01KG79N9AGV5YDG13TPHW7TZRH"
   ]
}
```
```json
// Response 
{
   "existingCandidateJobMatchingScores": [
      {
         "candidateParsedCvId": "string",
         "matchingScore": 10,
         // other details
      }
   ],
   "initiatedCandidateJobMatchingScores": [
      {
         "candidateParsedCvId": "string",
         "candidateJobMatchingId": "string"
      }
   ],
   "failedCandidateJobMatchingScores": [
      {
         "candidateParsedCvId": "string",
         "error": "string", // optional
      }
   ]
}
```

