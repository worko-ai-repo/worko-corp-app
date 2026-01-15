
1. Lambda name: `worko-cand-profile-parser-dev`
   1. S3 Triggers:
      1. `worko-corporate-cand-profile-dev`
         Full s3 path: `worko-corporate-cand-profile-dev/companies/{companyId}/bulk-cvs/01JJE6VEV1JRQ424RMJNXYVEN3.pdf`
      2. `worko-admin-cand-profile-dev`
         Full s3 path: `worko-admin-cand-profile-dev/bulk-cvs/01JJE6VEV1JRQ424RMJNXYVEN3.pdf`

2. Logic
   1. Parse the `cv`
   2. Duplicacy checks
      1. If `companyId` exists in `aws s3 trigger` details
         1. Check duplicacy in `corporateCandidateProfiles` collection in `worko-corp-db-dev` database, refer duplicacy logic:
            ```ts
            db.collection("corporateCandidateProfiles")
            .where("companyId", "==", companyId)
            .where(
               Filter.or(
                  Filter.where("candidateEmail", "==", "shaukat@gmail.com"),
                  Filter.and(
                     Filter.where(
                        "phoneNumberDetails.number",
                        "==",
                        9666308100
                     ),
                     Filter.where(
                        "phoneNumberDetails.countryCode",
                        "==",
                        91
                     )
                  )
               )
            )
            .get()
            ```
            1. If not duplicate:
               1. `worko-cand-profile-parser-dev` will trigger `sqs` event which is present in `worko-corp-app` repository by sending `parsing` response:
                  1. SQS Event name: `CORPORATE_CAND_PROFILE_BULK_UPLOAD`
                  2. body: 
                     ```json
                     {
                        "companyId": "...",
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
            2. if duplicate then do not trigger `sqs`
      
      2. If no `companyId` present in `aws s3` trigger details
         1. Check duplicacy in `centralCandidateProfiles` collection in `worko-corp-db-dev` database, refer duplicacy logic:
            ```ts
            db.collection("centralCandidateProfiles")
            .where(
               Filter.or(
                  Filter.where("candidateEmail", "==", "shaukat@gmail.com"),
                  Filter.and(
                     Filter.where(
                        "phoneNumberDetails.number",
                        "==",
                        9666308100
                     ),
                     Filter.where(
                        "phoneNumberDetails.countryCode",
                        "==",
                        91
                     )
                  )
               )
            )
            .get()
            ```
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
            2. if duplicate then do not trigger `sqs`
