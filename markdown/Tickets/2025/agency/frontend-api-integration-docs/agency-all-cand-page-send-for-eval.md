
# Whenever `corporate` or `worko-admin` clicks `Accept & Send for evaluation` below is api call order:
1. 
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-user-submission/send-for-evaluation`
   ```json
   // Request body
   {
      "agencyUserSubmissionId": "01KAX0W698BF859YWGHVG6DDCS",
      /**
         * jobId
         * 
         * @reference `id` attribute of `CompanyJob.model.ts`
         */
      "jobId": "01K99Y99X89H2DC588AZJ2J6RV",
      "companyName": "NELLSYS"
   }
   ```
   ```json
   // Response body
   {
      // ...
      "candidateParsedCvId": "01KB55EB06MYA4MGWSGKQB9S4F",
      "userJobApplicationId": "01KAZFC8WHW7UUU2PBB7MF6WDN",
      "jobApplicationStatus": "UNDER_EVALUATION"
      // ...
   }
   ```

2. If `corporate` wants to send to `2` evaluators then hit below api `2` times, its like `one job application` to `many evaluators` [ONE-to-MANY]
   1. first evaluator
   [POST] `https://jobs.dev.worko.work/request-evaluation/`
      ```json 
      // Request Body
      {
         "jobApplicationId": "01KAZFC8WHW7UUU2PBB7MF6WDN",
         "jobId": "01K99Y99X89H2DC588AZJ2J6RV",
         "jobTitle": "three full stack developer (react.js | node.js | aws)",
         "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
         "applicantUserEmail": "...",
         "candidateParsedCvId": "01KB55EB06MYA4MGWSGKQB9S4F",
         "applicantName": "string",
         "hrName": "Rohith Appala",
         "hrCurrentCompanyName": "NELLSYS",
         "evaluatorDetails": {
            "name": "eval first rohith",
            "email": "rohithappala777@worko.ai"
         },
         "hrDetailedFeedback": "test",
         "hrHtmlDetailedFeedback": "<p>test</p>"
      }
      ```
   2. second evaluator
   [POST] `https://jobs.dev.worko.work/request-evaluation/`
      ```json 
      // Request Body
      {
         "jobApplicationId": "01KAZFC8WHW7UUU2PBB7MF6WDN",
         "jobId": "01K99Y99X89H2DC588AZJ2J6RV",
         "jobTitle": "three full stack developer (react.js | node.js | aws)",
         "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
         "applicantUserEmail": "...",
         "candidateParsedCvId": "01KB55EB06MYA4MGWSGKQB9S4F",
         "applicantName": "string",
         "hrName": "Rohith Appala",
         "hrCurrentCompanyName": "NELLSYS",
         "evaluatorDetails": {
            "name": "eval two rohith",
            "email": "rohithappala999@worko.ai"
         },
         "hrDetailedFeedback": "test two",
         "hrHtmlDetailedFeedback": "<p>test three</p>"
      }
      ```

# Agency dashboard
1. 
[POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/candidate-parsed-cv/01KB55EB06MYA4MGWSGKQB9S4F`
```json
// Response
{
    "name": "first name last name",
    "email": "email@email.com",
    "phoneNumberDetails": {
        "number": 6175551234,
        "countryCode": 91
    },
    "currentCompany": "BYJUS",
    "currentDesignation": "fake developer",
    "totalYOE": 2,
    "relevantYOE": 10,
    "currentCTC": 10,
    "expectedCTC": 23,
    "noticePeriod": 120,
    "location": "anywhere, ma 02116",
    "readyToRelocate": true,
    "isNoticePeriodNegotiable": true,
    "cvAwsS3FileName": "01K9VHKJS36RQ3P39BZPW2E43Z.pdf",
    "id": "01KB55EB06MYA4MGWSGKQB9S4F",
    "createdAt": "2025-11-28T12:01:41.881+00:00",
    "updatedAt": "2025-11-28T12:01:41.881+00:00",
    "agencyUserId": "5HWCYGNW71E32A5GY6133TFH8Q",
    "agencyRegisteredEmail": "rohithappala777+agencyinviteone@gmail.com",
    "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
    "jobId": "01KATY4NSEFBD1V3TS2S2E0PE7",
    "cvAwsS3ResourceType": "AGENCY_SUBMIT_USER_CV",
    "cvAwsS3BucketName": "worko-app-dev",
    "cvAwsS3FilePath": "agencies/5HWCYGNW71E32A5GY6133TFH8Q/companies/01JWAQF1G96E0SE9XHXSFGHNWW/jobs/01KATY4NSEFBD1V3TS2S2E0PE7/user-profiles",
    "cvAwsS3FileTracker": [
        {
            "actionDate": "2025-11-28T12:01:41.881+00:00",
            "resourceType": "AGENCY_SUBMIT_USER_CV",
            "bucketName": "worko-app-dev",
            "filePath": "agencies/5HWCYGNW71E32A5GY6133TFH8Q/companies/01JWAQF1G96E0SE9XHXSFGHNWW/jobs/01KATY4NSEFBD1V3TS2S2E0PE7/user-profiles",
            "fileName": "01K9VHKJS36RQ3P39BZPW2E43Z.pdf"
        }
    ],
    "agencyUserSubmissionId": "01KB55EB06Y90599QP8DQG0TMN",
    "corporateCandidateProfileId": "01KB55EB06C0WXC67Z87WBYXN0"
}
```