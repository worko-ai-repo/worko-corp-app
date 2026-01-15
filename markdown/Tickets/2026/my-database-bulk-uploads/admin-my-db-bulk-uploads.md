
# Admin dashboard
1. Let's say a worko-admin uploads a single cv
2. Upload it to aws s3
3. Parse it using ai
4. Check the duplicacy using `candidate email` and `candidate phone number`
5. Store in 
   1. `CandidateParsedCv` 
   2. create `CentralCandidateProfile`


# Low level Flow
1. FE calls an api to generate pre-signed urls to upload
   [POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/central-candidate-profile/resumes`
   ```json
   // Request body
   {
      // DO NOT SEND "companyId"

      "bulkCvs": [
         {
            "fileName": "TestCV.pdf",
            "fileMimeType": "application/pdf"
         }
      ]
   }
   ```
   ```json
   // Response 
   {
      "bulkCvs": [
         {
            "userFileName": "TestCV.pdf",
            "cloudFileName": "{ulid}.pdf",// File name which is stored in AWS S3 bucket
            "fileMimeType": "application/pdf",
            "fileExtension": "pdf",

            /*
            AWS S3 PATH:- "worko-admin-cand-profile-dev/bulk-cvs/01JJE6VEV1JRQ424RMJNXYVEN3.pdf"
            */
            "awsS3SignedUrl": "..." // AWS S3 Signed Url used to upload the file to AWS S3
         }
      ]
   }
   ```
2. Using those pre-signed urls, FE will upload all those `cvs` to `aws s3`
3. For Each cv upload to s3 then that `cv` will be get triggerred `worko-cand-profile-parser-dev` lambda and all the details will be get parsed, once successfully get parsed then
   1. If no `companyId` exists in `aws s3 trigger` details
      1. Check duplicacy in `centralCandidateProfiles` collection in `worko-corp-db-dev` database, refer `getDuplicateCorporateCandidateProfile` method in `CorporateCandidateProfile.dao.ts` logic in `worko-corp-app` repository
         1. If not duplicate:
            1. `worko-cand-profile-parser-dev` will trigger `sqs` event which is present in `worko-corp-app` repository by sending `parsing` response:
               1. SQS Event name: `ADMIN_CAND_PROFILE_BULK_UPLOAD`
               2. body: 
                  ```json
                  {
                     // DO NOT SEND "companyId"
                     "cvExtractedParsed": {
                        candidateName: string; //  "Rohith Appala";
                        candidateEmail: string; // "rohithappala777@gmail.com";
                        candidatePhoneNumber: string; // "+919666308100";
                        candidateNumber: number; // 9666308100;
                        candidatePhoneCountryCode: number; // 91;
                        candidateCurrentCompany?: string; // "Worko.ai-India";
                        candidateCurrentDesignation?: string; // "NodeJs Backend Developer";
                        candidateExperience?: number; // 3;
                        candidateTotalYOE?: number; // 3;
                        candidateRelevantYOE?: number; // 4;
                        candidateCurrentCTC?: number; // 10;
                        candidateExpectedCTC?: number; // 9;
                        candidateNoticePeriod?: number; // 60;
                        candidateLocation?: string; // "Hyderabad, Telangana";
                        candidateReadyToRelocate?: boolean; // false;
                        isNoticePeriodNegotiable?: boolean; // false;

                        coreSkills?: {
                           skillName: string;
                           years: number;
                           timestamps?: {
                              createdAt: string;
                              updatedAt: string;
                           };
                        }[];
                        technicalSkills?: {
                           skillName: string;
                           years: number;
                           timestamps?: {
                              createdAt: string;
                              updatedAt: string;
                           };
                        }[];
                        userPreferredDepartments?: string[];
                        userPreferredIndustries?: string[];
                        userPreferredlocations?: string[];
                        userPreferredRoles?: string[];                        
                     }
                  }
                  ```
4. Check the duplicacy using `candidate email` and `candidate phone number` against a `companyId` and Store in 
   1. `CandidateParsedCv` 
   2. Check and create `CentralCandidateProfile`
