

1. Will post a job in `linkedin`
   1. `http://localhost:8080/v0/apply-job?jobId=01KADGBTX00T5HX5M23R4VSAQ9`
      1. If some user clicks above link we will open our worko portal:
         1. get job by id and populate some job details:
         2. will show below input form to candidate
            1. CTC
            2. ECTC
            3. Notice period
            4. upload resume
            5. `Submit` button:
               1. Generate Pre-signed url to submit cv to `s3`
               2. Frontend will Use `awsS3SignedUrl` api to upload to `s3`
               3. Parse api -> `29 seconds`
                  1. Get job by id and throw error if job not found
                  2. trigger the ai code and ai will give parsed cv response 
                     1. you will check `createdByCorporateUserId` in `existingJobDetails`
                        1. use `companyId` from `existingJobDetails` and use `candidateEmail`, `phoneNumber` and check using `corporateCandidateProfileServiceObj.getDuplicateCorporateCandidateProfile()`
                           1. if duplicate then you will recieve some data:
                              1. in `existingCorporateCandidateProfileData` you will use `candidateParsedCvId` and retrieve `candidateParsedCvServiceObj.getCandidateParsedCvById(
                                 existingCorporateCandidateProfileData.candidateParsedCvId
                              )`
                                 1. check `cvAwsS3ResourceType` in `resourceType` of `cvAwsS3FileTracker` array of object
                                    1. lets say you will recieve array of `2` objects
                                       1. you check latest `actionDate`
                                          1. for this latest `actionDate` you check whether it is more than `3` months or not
                                             1. if yes, more than `3` months:
                                                1. update below object in `candidateParsedCvs` collection using 
                                                `existingCorporateCandidateProfileData.candidateParsedCvId` using `candidateParsedCvServiceObj.updateCandidateParsedCvById()`
                                                ```json
                                                {
                                                   "updatedAt":  dateHelperObj.getISODate(),
                                                }
                                                ```
                                             2. if no, more than `3` months:
                                                1. throw `409`, `duplicate resume` error
                           2. if not duplicate then you will recieve empty data
                        2. first you will check query from `centralCandidateProfileServiceObj.getCentralCandidateProfileById`
                     2. you will check `createdByUserId` in `existingJobDetails`
               2. 


1. guy who clicked link is already a registered
2. guy who clicked link is unregistered
