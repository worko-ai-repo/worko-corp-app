

1. Lambda name: `worko-referral-source-cand-profile-parser-dev`
   1. S3 Triggers:
      1. `worko-referral-source-cand-profile-parser-dev`
         Full s3 path: `worko-referral-email-dev/referral-sourcetype/0h47scor2sup779lmu5u6if6pkm8ncoio6808eg1`

2. Logic
   1. Retrieve object from `worko-referral-email-dev/referral-sourcetype/` path 
   using `aws s3 sdk`
   2. Retrieve the content from the object using some `mailparser` library
      1. If `Subject` contains this kind of text `Subject: (Gmail Forwarding Confirmation - Receive Mail from rohithappala999@gmail.com` then send `https://mail-settings.google.com/mail/vf-%5BANGjdJ_aY9DbzldvCdipX__GY3kL6rsL2LE9z2X7-RjHj_mHd1cMyxp06Cv4RaqHPYRWKfoJjxW20LmQpBEVpLL2reIGEJNVckwcKv6BNg%5D-8i1-Oh-qsDhpQLc9-HmRV1HaXU8` email to `rohithappala999@gmail.com` address using `aws ses sdk`
      2. Else if it has an attachment:
         1. Parse the `cv`
         2. Duplicacy checks
            1. Retrieve `companyId` from `To: SWIGGYCOMPANYID@referral.worko.work` so companyId is `SWIGGYCOMPANYID`
            2. Check duplicacy in `corporateCandidateProfiles` collection in `worko-corp-db-dev` database, refer duplicacy logic:
               ```ts
               db.collection("corporateCandidateProfiles")
               .where("companyId", "==", "SWIGGYCOMPANYID")
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
                  1. Upload the parsed cv to below aws s3 path using `aws s3 sdk`:
                     ```sh
                     # "SWIGGYCOMPANYID" is company id
                     # FORMAT:- "worko-corporate-referral-source-cv-dev/companies/{companyId}/referral-source-cvs/{random-ulid}.pdf"
                     # EXAMPLE:- "worko-corporate-referral-source-cv-dev/companies/SWIGGYCOMPANYID/referral-source-cvs/01JJE6VEV1JRQ424RMJNXYVEN3.pdf
                     ```
                  2. `worko-referral-source-cand-profile-parser-dev` will trigger `sqs` event which is present in `worko-corp-app` repository by sending `parsing` response:
                     1. SQS Event name: `CORPORATE_CAND_PROFILE_REFERRAL_SOURCE`
                     2. body: 
                        ```json
                        {
                           "companyId": "SWIGGYCOMPANYID",
                           "candidateCvAwsS3FileName": "01JJE6VEV1JRQ424RMJNXYVEN3.pdf",
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
               2. if duplicate then do not store in aws `s3` and do not trigger `sqs`
