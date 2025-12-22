# Search By Job Id(`webdev`)
1. sarvesh@gmail.com `find match score`: 
      1. POST /candidate-parsed-cv/find-matching-score
         ```json
         // Request body
         {
            "candidateParsedCvId": "string",
            "jobId": "string"
         }
         ```
         ```json
         // response
         // status code: 202
         { 
            "candidateJobMatchingId": "4aa8624c8bf1a1abc049",
            "message": "Matching score process initiated." 
         }
         ```
      2. GET /candidate-job-matching/4aa8624c8bf1a1abc049
      ```json
      {
         "id": "4aa8624c8bf1a1abc049",
         "candidateEmail": "srigayathiri045@gmail.com",
         "jobId": "01KAE3ETBBSXT1CDF9BRATKR2P",
         "createdAt": "2025-12-19T09:55:30.405+00:00",
         "updatedAt": "2025-12-19T09:55:30.405+00:00",
         "createdByCorporateUserId": "21GCPHNR5HE10D0S8YSMZGS63H",
         "isFindMatchingScoreInProgress": false,
         "matchingScore": 70,
         // ...
      }
      ```

# Search By Prompt
1. rohith@gmail.com `find match score`
2. sarvesh@gmail.com `find match score`: 
   1. when `find match score` btn is clicked, ui will open a sidebar to select a job
      1. corp selected a `webdev` job:
         POST /candidate-parsed-cv/find-matching-score
         ```json
         // Request body
         {
            "candidateParsedCvId": "string",
            "jobId": "string"
         }
         ```
         ```json
         // status code: 200
         {
            "id": "4aa8624c8bf1a1abc049",
            "candidateEmail": "srigayathiri045@gmail.com",
            "jobId": "01KAE3ETBBSXT1CDF9BRATKR2P",
            "createdAt": "2025-12-19T09:55:30.405+00:00",
            "updatedAt": "2025-12-19T09:55:30.405+00:00",
            "createdByCorporateUserId": "21GCPHNR5HE10D0S8YSMZGS63H",
            "isFindMatchingScoreInProgress": false,
            "matchingScore": 70,
            // ...
         }
         ```
      2. corp selected a `pythondev` job:
         1. POST /candidate-parsed-cv/find-matching-score
            ```json
            // Request body
            {
               "candidateParsedCvId": "string",
               "jobId": "string"
            }
            ```
            ```json
            // response
            // status code: 202
            { 
               "candidateJobMatchingId": "4aa8624c8bf1a1abc049",
               "message": "Matching score process initiated." 
            }
            ```
               1. GET /candidate-job-matching/4aa8624c8bf1a1abc049
               ```json
               {
                  "id": "4aa8624c8bf1a1abc049",
                  "candidateEmail": "srigayathiri045@gmail.com",
                  "jobId": "01KAE3ETBBSXT1CDF9BRATKR2P",
                  "createdAt": "2025-12-19T09:55:30.405+00:00",
                  "updatedAt": "2025-12-19T09:55:30.405+00:00",
                  "createdByCorporateUserId": "21GCPHNR5HE10D0S8YSMZGS63H",
                  "isFindMatchingScoreInProgress": false,
                  "matchingScore": 70,
                  // ...
               }
               ```
