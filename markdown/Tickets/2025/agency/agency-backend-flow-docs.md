
# Referee type
## Referral
   1. We will give example email: `retrieveuserprofiles@worko.ai` to a company(ex: `amazon`), if anyone sends candidate's 
      `cv` to `retrieveuserprofiles@worko.ai` email for `amazon` company then we need to retrieve that `cv` and check duplicacy
      and if not duplicate we will parse user cv and store user info against `amazon` company under `Referral` source type
## Internal
   1. Whenever a `corporate` or `worko-admin` uploads bulk cv's against particular `companyJob` for screening
   2. Whenever a `corporate` uploads bulk cv's against his particular `company` 
   3. Whenever a `worko-admin` uploads bulk cv's 
## Agency 
   1. Whenever an `agency` upload `candidate's cv` for particular `companyJob`
## Worko
   1. Whenever a `registered candidate` apply `companyJob` at `worko` job portal
   2. Whenever a user signups as a `candidate`

# Admin Dashboard
## Pages
   1. My database
      1. List of all the user profiles (it may from `Referral`, `Internal`, `Agency`, `Worko`) with below column names:
         1. Candidate name
         2. Email id
         3. Contact no
         4. Current designation
         5. Applied Companies -> all the company names this user profile is present example `Swiggy`, `Zomato`
         6. Current CTC
         7. Expected CTC
         8. Notice period
         9. Current location
         10. Added by
         11. Added for
         12. Cooling period companies
         13. Last active
         14. YOE
         15. CV
         16. Action:
            1. Edit profile button:
               1. when `Edit profile button` is clicked below input form will be open:
                  1. Candidate name
                  2. Candidate email
                  3. Candidate contact no
                  4. Current company
                  5. Current designation
                  6. Total YOE
                  7. Current CTC
                  8. Expected CTC
                  9. Location
                  10. Notice period
                  11. Cooling period companies
                  12. CV
   2. Agency 
      1. List of all the submitted user profiles by all the agencies(assigned by all corporates) for all the companies with below columns:
         1. Job profile
         2. Agency name
         3. Date submitted
         4. Applicant name
         5. Email id
         6. Phone number
         7. Current company
         8. Current designation
         9. Total YOE
         10. Relevant YOE
         11. Current CTC
         12. Expected CTC
         13. Notice period
         14. Location
         15. Ready to relocate
         16. Any comment
         17. CV 
         18. Worko score:
            1. Find matching score button
         19. Action -> `worko admin` should not perform any actions, `worko admin` can only have `view only access`
         20. Current status
   3. Agency List
      1. Worko admin cannot add or invite `agency`
      2. The list of all corporate invited and registered agencies with below column names:
         1. Agency name
         2. Email id
         3. Contact person name
         4. Ph no
         5. Date activated
         6. Assigned jobs
         7. Total candidate submitted
         8. Total rejected
         9. Total hired
         10. Action -> `Should we allow worko admin to perform actions on job appl profiles ??`
         11. GSTIN No
         12. Contract copy


# Corporate Dashboard
## Pages
   1. My database:
      1. List of all the user profiles (it may from `Referral`, `Internal`, `Agency`, `Worko`)
      by the `corporate loggedin` company with below column names:
         1. Referred by
         2. Referee type
         3. Date
         4. Profile name
         5. Candidate name
         6. Current company
         7. Current designation
         8. Current CTC
         9. Expected CTC
         10. Notice period
         11. Location comfortable with
         12. Remark
         13. CV 
         14. Action:
            1. Edit profile button:
               1. when `Edit profile button` is clicked below input form will be open:
                  1. Candidate name
                  2. Candidate email
                  3. Candidate contact no
                  4. Current company
                  5. Current designation
                  6. Total YOE
                  7. Current CTC
                  8. Expected CTC
                  9. Location
                  10. Notice period
                  11. Referred by/Added by
                  12. CV
   2. Agency 
      1. List of all submitted user profiles by agencies(only assigned by corporate) for the loggedin corporate company by below column names:
         1. Job profile
         2. Agency name
         3. Date submitted
         4. Applicant name
         5. Email id
         6. Phone number
         7. Current company
         8. Current designation
         9. Total YOE
         10. Relevant YOE
         11. Current CTC
         12. Expected CTC
         13. Notice period
         14. Location
         15. Ready to relocate
         16. Any comment
         17. CV 
         18. Worko score:
            1. Find matching score button
         19. Action:
            1. Accept & move to application button
            2. Reject button
            3. Accept & Send for evaluation button
         20. Current status
   3. Agency List Page
      1. `Add agency` button:
         1. When `Add agency` button is clicked below input form will open:
            1. Agency name
            2. Agency email
               1. This can be any valid email(not restricted to enter `company email`)
            3. Contact person name 
            4. Contact number
            5. GSTIN 
            6. Contract copy 
               1. upload to `s3`:
               ```sh
               Amazon S3 > Buckets > worko-corporate-{environment}/companies/{companyId}/agency-invites/{agencyInviteId}/contract-copies/
               ```
            7. `Invite` button:
               1. When `Invite` button is clicked below steps will happen:
                  1. Create agency invite api will be called by `FE` and below steps will be followed in the api:
                     1. Get company details by `companyId` api request body details 
                        1. If not found:
                           1. Throw an error by saying: `Company details not found`
                     2. Get the `corporate` details by `corporate user id`(comes from "worko-auth" lambda)
                        1. If not found:
                           1. Throw an error
                        2. If found:
                           1. Check whether `companyId` from `Corporate details` and `companyId` from `api request body details` are same or not
                              1. If not same:
                                 1. Throw forbidden access error
                     3. Get the agency invite details by `companyId`,`agencyEmail`, `invitedByCorporateUserId` api request body details
                        1. If found:
                           1. Throw an error by saying: `You have already invited the agency.`
                        2. If not found:
                           1. Create agency details in db
                           2. Get Agency Registered details
                              1. If Agency is already registered:
                                 1. Send Email to `agency` with Login url
                              2. If Agency is not registered:
                                 1. Send Email to `agency` with Register url
                           3. Return the created agency details to `ui`
                  2. After creating `agency invite` FE will Call Generate PSU to upload Contract Copy File to Aws s3 and below steps will be followed in backend api:
                     1. Get company details by `companyId` given in api request body details 
                        1. If not found:
                           1. Throw an error by saying: `Company details not found`
                     2. Get agency invite by `inviteId` given in api request body details 
                        1. If not found:
                           1. Throw an error
                     3. Get the `corporate` details by `corporate user id`(comes from "worko-auth" lambda)
                        1. If not found:
                           1. Throw an error
                        2. If found:
                           1. Check whether `companyId` from `Corporate details` and `companyId` from `api request body details` are same or not
                              1. If not same:
                                 1. Throw forbidden access error
                     4. Check whether the `companyId` from `Corporate details` and `companyId` from `Agency invite details` are same or not
                        1. If not same:
                           1. Throw forbidden access error
                     5. Check whether the `corporate user id`(comes from "worko-auth" lambda) and `invitedByCorporateUserId` from `Agency invite details` are same or not
                        1. If not same:
                           1. Throw forbidden access error
                     6. Generate s3 path and store in `aws s3`
                  
                  3. After storing `contract copy` to s3 `FE` will call Update Agency Invite with "contractCopyAwsS3FileName" and "contractCopyUserFileName" api with below steps:
                     1. Get company details by `companyId` given in api request body details 
                        1. If not found:
                           1. Throw an error by saying: `Company details not found`
                     2. Get agency invite details by `companyId`, `inviteId`, `agencyInviteEmail` given in api request body details
                        1. If not found:
                           1. Throw an error
                        2. If found:
                           1. Check whether the `corporate user id`(comes from "worko-auth" lambda) and `invitedByCorporateUserId` from `Agency invite details` are same or not
                              1. If not same:
                                 1. Throw forbidden access error
                              2. If same:
                                 2. Update `agency invite` details with `contract copy` s3 file name
                     
      2. The `Corporate` invited list of `agencies` with below column names:
         1. Agency name
         2. Email id
         3. Contact person name
         4. Assigned jobs
         5. Total candidate submitted
         6. Total rejected
         7. Total hired
         8. Action:
            1. `Assign jobs` button:
               1. First show the list of jobs according to the `corporate` role and his company id
               2. Call Assign Multiple Jobs to Agency api after selecting jobs and submitting and in backend below steps are being followed:
                  1. Bulk Create Assigned records
            2. Remove jobs button
            3. Edit button
            4. Pause button
            5. Delete button
         9. GSTIN No
         10. Contract copy




# Agency Dashboard
## Signup
   1. `Corporate` will send invite request to a person via email to signup and access `agency` dashboard 
      1. After person clicks the email he recieved below input form will be open
         1. Full name
         2. Contact number
         3. Email
         4. Password
         5. Confirm Password
         6. Enter Otp
         7. Signup:
            1. When `Signup` button is clicked:
               1. FE will try to store `email` in `worko-agency` user pool of `aws cognito`
                  1. If email already present:
                     1. `FE` will show message: `you have already registerd popup and navigate to login page`
                  2. If email not present then `email` will store in `cognito` with `unverified` email status and user will recieve an `otp`
                     1. After user enters `otp` 
                        1. If `otp` is correct
                           1. FE will call `agency register` api and backend will follow below steps in api:
                              1. Check whether the `cognitoUserId` present in `aws cognito user pool` or not
                                 1. If not found:
                                    1. Throw an error
                                 2. If found:
                                    1. Compare the api request body `email` and `cognitoEmail` is same or not
                                       1. If not same:
                                          1. Throw an error
                                    2. Check whether email is verified in `cognito` or not
                                       1. If not verified 
                                          1. Throw an error
                              2. Check whether the `invite` id is present or not
                                 1. If not present:
                                    1. Throw an error
                                 2. If present:
                                    1. Check whether the email in invite details and cognitoEmail is same or not
                                       1. If not same:
                                          1. Throw an error
                              3. Check whether the agency registered details are already stored in db or not
                                 1. If already present 
                                    1. throw an error
                                 2. If not present
                                    1. Create agency register document
                                       1. If created successfully
                                          1. Update the respective invite status as `Accepted`
                        2. If `otp` is wrong
                           1. Throw an error by not calling `agency register api`                       
## Login
   1. Whenever `corporate` sends an invite and if `agency` is already registered then he recieves
      agency dashboard Login url
      1. Email Id
      2. Agency name
      3. Password

## Pages
   1. Invites
      1. List of invites recieved from different `companies` and different `corporates` with below column names:
         1. Company name
         2. Sender name(HR)
         3. Date
         4. Action / Current status
            1. `Accept` button:
               1. 
            2. `Reject` button:
   2. Jobs 
      1. List of different `Company Jobs` assigned by different `corporates` with below column names:
         1. Company name
         2. Profile -> `jobTitle`
         3. YOE range
         4. Salary range
         5. Location
         6. Notice period
         7. Date assigned
         8. `Upload profile` button -> `Upload candidate cv`
            1. Call `s3` api to store `cv`:
               ```sh
               Amazon S3 > Buckets > worko-app-{environment}/agencies/{agencyUserId}/companies/{companyId}/jobs/{jobId}/user-profiles/cvOne.pdf
               ```
                  1. Get agency registered details by `agency user id`(comes from "worko-auth" lambda) 
                     1. If not found:
                        1. Throw error
                  2. Check whether company details are present by using `companyId`
                     1. If not found:
                        1. Throw error     
                  3. Check whether job details are present by using `jobId`
                     1. If not found:
                        1. Throw error
                     2. If found:
                        1. Check whether the `companyId` in reqBody is same as `companyId` in `job details`
                           1. If not:
                              1. Throw error
                  4. Check whether this `companyJob` is assigned to this `agency` or not by using `companyId` `agencyRegisteredEmail`,`jobId` in `AgencyJobAssignment` model
                     1. If not throw an error
                  5. store in to `s3 path` and return the `upload url`
            2. Parse cv by agency api will be called and below steps will happen in the api:
               1. 
                  1. After api return response `FE` will show response details in below `popup` 
                     1. Candidate name
                     2. Candidate email
                     3. Candidate contact number
                     4. Current company
                     5. Current designation
                     6. Total YOE
                     7. Relevant YOE
                     8. Current CTC
                     9. Expected CTC
                     10. location
                     11. Ready to relocate
                     12. Notice period: Negotiable checkbox
                     13. CV
                     14. Any comments
         9. Candidates uploaded -> `count of candidate profiles/cvs which is uploaded by agency`
         10. Candidates rejected -> `count of rejected job application status`
         11. Candidates in-process -> `count of other than rejected job application status`
   3. Applicants
      1. List of User profiles submitted by individual `agency` with below column names:
         1. Company name
         2. Job profile
         3. Date submitted
         4. Applicant name
         5. Email Id
         6. Contact number
         7. Current company
         8. Current designation
         9. Total YOE
         10. Relevant YOE
         11. Current CTC
         12. Expected CTC
         13. Notice period
         14. Location
         15. Ready to relocate
         16. Any comment 
         17. CV
         18. Current status
   4. Bulk cv check
      1. As of now implement the way it is implemented in `corporate` dashboard
   5. Recharge
      1. Integrate razorpay payment gateway
      2. `15 RS / CV`






# User pool notes
1. "worko" aws cognito user pool:
   1. We are using "worko" user pool for below:
      1.  `corporate` login  -> login with only company emails
      2. `candidates` login -> with any valid emails
   2. we have cognito user groups as 
      1. "admin" -> only `candidate` emails are adding in this group manually from `aws cognito` by `CTO` for company usage purpose
      2. "corporate-recruiter"
      3. "corporate-admin"
2. Now we have `agency` signups and logins, we are creating `worko-agency` user pool to store `email-passwords`
   1. so that if `candidate` with `rohith123@gmail.com` already have `Cand@123` account and if agency with 
   same `rohith123@gmail.com` try to signup with `Agency@123` then we will store this in `worko-agency`
   and `rohith123@gmail.com`-`Cand@123` will already stored in `worko` user pool, so it will be seperate accounts
3. Now we are using `worko-auth.mjs` as authorizer for `worko` user pool
   and some apis are authorized in this for `corporate-recruiter`,`corporate-admin`,`admin`
   so im thinking to use `worko-agency-auth.mjs` as authorier for `worko-agency` user pool, so which is better way, should i use same `worko-auth.mjs` for both user pools, the `dev-worko-corp` api gateway is used by both `corporate-admin`, `worko-admin`, `corporate-recruiter` and now `agency` in different user pool will also use it


1. 
   ```json
   // Request payload
   {
      "searchByPrompt": "give me cand with 7 years experience",
      "searchByJobDescription":"..."
   }
   ```

# Find matching score integration details
1. lambda name:
   ```sh
   "worko-sourcetype-jd-resume-matching-dev"
   "worko-sourcetype-jd-resume-matching-prod"
   ```
2. request payload:
```ts
{
  /**
   * @reference The "id" attribute of the "CompanyJob.model.ts" from AWS DynamoDB
   */
  jobId: string;

  /**
   * @example
   *  In dev environment
   *    1. "worko-app-dev" 
   *    2. "worko-corporate-dev" 
   *  In prod environment
   *    1. "worko-app-prod" 
   *    2. "worko-corporate-prod"
   */
  cvAwsS3BucketName: string;

  /**
   * @example
   *  1. "/agencies/{agencyUserId}/companies/{companyId}/jobs/{jobId}/user-profiles"
   *  2. "/users/{userId}/resumes"
   *  3. "/companies/{companyId}/bulk-cvs/{corporateBulkJdId}"
   */
  cvAwsS3FilePath: string;

  /**
   * @description
   *  1. Name of the aws s3 file
   *
   * @example "01K8TPT1PT2W5DTRSFPWTB92GH.pdf"
   */
  cvAwsS3FileName?: string;
}
```
3. Response 
```ts
{
  cvExtract?: string;
  jdMatchErrorCode?: number;
  jdMatchErrorDesc?: string;
  matchingScore?: number;
  checkEXPdata?: object;
  rejectCTCAndEXP?: boolean;

  /**
   * This is for `corporate-admin/recruiter` and `worko-admin`
   */
  rejectionFeedbackBySystem?: string;

  /**
   * This is for `candidate`
   */
  rejectionFeedbackBySystemForApplicant?: string;
  scoreDetails?: string;
  scoreDetailsForApplicant?: string;
  scoreFetchedDate?: string;

  /**
   * emailFeedback
   *
   * This attribute will be generated by `python code` when the user applied for a job
   * and will be used to send in email to job posters about job application
   *
   * @example "Candidate excels with over 5 years in Selenium automation, strong technical skills in Selenium, Protractor, Jenkins, and GitLab, and recognized agility in Agile environments."
   */
  emailFeedback?: string;
}
```

# Candidates cvs storing paths
```sh
# Whenever agency submits candidates cv for particular "company job"
worko-app-dev/agencies/{agencyUserId}/companies/{companyId}/jobs/{jobId}/user-profiles/<candidateAwsS3FileName>

# Whenever user registers to worko job portal
worko-app-dev/users/{userId}/resumes/<candidateAwsS3FileName>

# Whenever corporate-admin/recruiter perform bulk screening on candidates
worko-corporate-dev/companies/{companyId}/bulk-cvs/{corporateBulkJdId}/<candidateAwsS3FileName>

# Whenever the candidate comes from "Referral" source type

```

# Move to applicants and find matching score use cases:
1. When at very first time if `corporate-admin/recruiter` or `admin` clicks on `move to applicants` button
without `find matching score` button then it should move to applicants section without storing matching score details
2. If at very first time `corporate-admin/recruiter` or `admin` clicks on `find matching score` button 
then we need to calculate matching score details
   1. if he likes he will use `move to applicants` api
3. move to applicants and find matching score buttons are present in below:
### Corporate Dashboard
    #### Agency Page
    #### Search in database Page
### Admin Dashboard
    #### Agency Page
    #### Search in database Page






# Total Pending From Backend Apis
## UI Integration
### Agency Dashboard
#### Jobs Page
1. Pending Column names in `Jobs` Page
   1. Candidates rejected -> `1 day`
      1. `check candidate counts specific and attach to it`
   2. Candidates in-process -> `1 day`
      1. `check candidate counts specific and attach to it`
#### Bulk cv check Page
1. build newly against `agency` -> `3 days`
#### Recharge Page
1. Second release


### Corporate Dashboard
#### Agency Page
1. Accept & move to application button -> `bulk select candidates` -> `1 day` 
2. Reject button -> `bulk select candidates` -> `1 day`
3. Accept & Send for evaluation button -> `bulk select candidates` -> `1 day`
#### Agency List Page
1. Pending Column names in `Agency List Page`:
   1. `Total rejected` -> `1` day
   2. `Total hired` -> `1` day
   3. Action:
      1. Remove jobs button -> `2` days
      2. Edit button -> `1` day
      3. Pause button -> `1` day
      4. Delete button -> `1` day
#### My database Page
1. Seach by `candidate name`
2. `Bulk upload cv` -> `1` day
3. `Filter by status`-> ["Blacklisted", "Under cooling period", "Under processing", "All"] -> `2` day
4. `Edit` button -> `bulk candidate selection` -> `1` day
5. `Disable` button -> `bulk candidate selection` -> `1` day
6. `Delete` button -> `bulk candidate selection` -> `1` day
7. `Forward` button -> `bulk candidate selection`
   1. `Move to applicants` -> `bulk candidate selection` -> `1` day
8. Pending Column names in `My database Page`:
   1. `Referred by` column name  -> `0.5` day
   2. `Remark` column name  -> `0.5` day
   3. `Action` column:
      1. `Edit` button  -> `1` day
10. Pending sub column names:
   1. last rejection date  -> `1` day
   2. Rejected by  -> `1` day
   3. Cooling period  -> `2` day
   4. Rejected reason  -> `1` day
#### Search in database Page -> `Not initiated`


### Admin Dashboard
#### Agency Page
1. Accept & move to application button -> `bulk select candidates`  -> `1` day
2. Reject button -> `bulk select candidates`  -> `1` day
3. Accept & Send for evaluation button -> `bulk select candidates`  -> `1` day
#### Agency List Page
1. Pending Column names in `Agency List Page`:
   1. `Total rejected`
   2. `Total hired`
   3. Action:
      1. Remove jobs button
         1. 
      2. Edit button 
      3. Pause button
         1. Agency can see every old data but they can't upload new profiles because the invite put onhold.
      4. Delete button
#### My database Page
1. Seach by `candidate name`
2. `Bulk upload cv`
3. `Filter by status`-> ["Blacklisted", "Under cooling period", "Under processing", "All"]
4. `Edit` button -> `bulk candidate selection`
5. `Disable` button -> `bulk candidate selection`
6. `Delete` button -> `bulk candidate selection`
7. `Forward` button -> `bulk candidate selection`
   1. `Move to applicants`
8. Pending Column names in `My database Page`
   1. `Added for` column -> `added for is for which company it was added in last 3 months, so the name of companies.`
   2. `Cooling period companies`  -> `1` day
   3. `Action` column:
      1. `Edit` button
#### Search in database Page -> `Not initiated`   -> `4` days


# Total R&D Pending from Backend
1. gcp environment variables are not populating to `job-app` api lamba when `worko-job-app` repo is deployed
2. for below payload the error message is blank for duplicacy:
```json
{
  "agencyName": "chipu",
  "email": "erikwhite85+001@gmail.com",
  "phoneNumberDetails": { "number": 7846587436, "countryCode": 91 },
  "name": "chipmonk",
  "GSTIN": "29AAACC1206D2ZB",
  "contractCopyUserFileName": "pankaj backend engineer.pdf",
  "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW"
}
```
3. `Composite indexes` best design which satifies `createdAt` sort order even any filter is applied


# Updates
1. worked on populating `core`,`tech`skills and `preference` data in corp db and central db and told shaukat
2. explained raj that how to integrate `accept and send for eval` in `corp`,`admin` and `eval` 
3. finished updating `agency user invite` by `corporate` 
4. `remove` jobs api for `agency` invite

# Today's Plan
1. `Delete` agency invite
2. `Pause` agency invite
3. 
