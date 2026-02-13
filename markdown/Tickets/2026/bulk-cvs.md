

1. s3 metadata:
   ```sh
   {
      "bulkSourceTypeResumeId": "DETXFCGVJHBNKXTFCGHBJN",
      "corporateUserEmail": "....", 
      "workoAdminUserEmail": "...."
   }
   ```
2. in first ai lambda `worko-cand-profile-parser-dev` 
   query document by "id" from `bulkSourceTypeResumes` collection
3. 
   1. first check `totalResumesProcessed` undefined or `0` that means it first lambda
   2. parse cv and do existing stuff
   3. use `FieldValue.increment(1)` for incrementing `totalResumesProcessed`(always) in `bulkSourceTypeResumes` collection and create document in `bulkSourceTypeParseResumes` collection with appropriate status
   .
   .
   .
   4. for 1000th lambda check count of `totalResumesSucceeded + totalResumesFailed + totalResumesDuplicate` is `999` with `totalResumesUploaded-1` then
      process cv and do existing stuff
   5. update `processingStatus` as "COMPLETED" in  
      and after creating `bulkSourceTypeParseResumes` collection with appropriate status,
      in this `1000`th lambda retrieve info from `bulkSourceTypeParseResumes` collection with status `DUPLICATE` and keep in `.csv` and send email to `corporateUserEmail` or `workoAdminUserEmail`
      retrieve info from `bulkSourceTypeParseResumes` collection with status `FAILED` and keep in `.csv` and send email to `corporateUserEmail` or `workoAdminUserEmail`


```ts
// for increment
import { FieldValue } from "@google-cloud/firestore";
const totalResumesSucceeded = FieldValue.increment(1)
```



# Pending Implementations in Bulk cvs feature
1. how to send `counts` of `failed`, `success`, `duplicate` to `react ui` 



# if `corporateCandidateProfile`
   1. check duplicacy
      1. if found:
         1. use `candidateParsedCvId` in `corporateCandidateProfile` as document id and retrieve data from `candidateParsedCvs`
            1. check `cvAwsS3FileTracker` array
               1. if find object containing `resourceType:CORP_CAND_BULK_CV_UPLOAD` in `cvAwsS3FileTracker` 
                  1. if you recieve one object:
                     1. then check `actionDate: "2026-01-27T14:56:23.954+00:00"`:
                        1. less than `3` months:
                           1. consider as `duplicate` and create document in `bulkSourceTypeParseResumes` as `DUPLICATE` status
                        2. more than `3` months
                           1. sqs with event name:
                              ```json
                              {    
                                 event: "OLDER_CV_CORPORATE_CAND_PROFILE_BULK_UPLOAD",
                                 companyId: string;
                                 candidateCvAwsS3FileName: string;
                                 cvExtractedParsed: SqsMsgCvExtractedParsedDto;
                              }
                              ```
                           2. do not consider as `duplicate` and create document in `bulkSourceTypeParseResumes` as `SUCCESS` status
      2. if not found:
         do same thing ..
         at last `CORPORATE_CAND_PROFILE_BULK_UPLOAD` sqs

# else If `centralCandidateProfile`
   1. check duplicacy
      1. if found:
         1. use `latestCandidateParsedCvId` in `centralCandidateProfile` as document id and retrieve data from `candidateParsedCvs`
            1. check `cvAwsS3FileTracker` array
               1. if find object containing `resourceType:ADMIN_CAND_BULK_CV_UPLOAD` in `cvAwsS3FileTracker` 
                  1. if you recieve one object:
                     1. then check `actionDate: "2026-01-27T14:56:23.954+00:00"`:
                        1. less than `3` months:
                           1. consider as `duplicate` and create document in `bulkSourceTypeParseResumes` as `DUPLICATE` status
                        2. more than `3` months
                           1. sqs with event name:
                              ```json
                              {    
                                 event: "OLDER_CV_ADMIN_CAND_PROFILE_BULK_UPLOAD",
                                 companyId: string;
                                 candidateCvAwsS3FileName: string;
                                 cvExtractedParsed: SqsMsgCvExtractedParsedDto;
                              }
                              ```
                           2. do not consider as `duplicate` and create document in `bulkSourceTypeParseResumes` as `SUCCESS` status
      2. if not found:
         do same thing ..
         at last `ADMIN_CAND_PROFILE_BULK_UPLOAD` sqs
