

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
