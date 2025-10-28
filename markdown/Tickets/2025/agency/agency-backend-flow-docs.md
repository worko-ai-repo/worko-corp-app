
# Referee type
## Referral
   1. We will give example email: `retrieveuserprofiles@worko.ai` to a company(ex: `amazon`), if anyone sends candidate's 
      `cv` to `retrieveuserprofiles@worko.ai` email for `amazon` company then we need to retrieve that `cv` and check duplicacy
      and if not duplicate we will parse user cv and store user info against `amazon` company under `Referral` source type
## Internal
   1. Whenever a `corporate` or `worko-admin` uploads bulk cv's against particular `companyJob` for screening
   2. Whenever a `corporate` uploads bulk cv's against his particular `company` 
   3. Whenever a `worko-admin` uploads bulk cv's against `WORKO` company
## Agency 
   1. Whenever an `agency` upload `candidate's cv` for particular `companyJob`
## Worko
   1. Whenever a `registered candidate` apply `companyJob` at `worko` job portal

# Admin Dashboard
## Pages
   1. My database
      1. List of all the user profiles (it may from `Referral`, `Internal`, `Agency`, `Worko`) with below column names:
         1. Candidate name
         2. Email id
         3. Contact no
         4. Current designation
         5. In Database -> all the company names this user profile is present
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
                     ```ts
                     /**
                      * @todo Need to add validations for email existence in "Aws cognito" by discussing with "CTO"
                      */
                     ```
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
## Notes:
   1. same email id which has been used for agency cannot be used in any other dashboard
   2.  there is mis information in figma while login we will not ask company name but while register we will ask its vice versa in figma
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
               1. FE will try to store in `cognito`
               2. FE will call `agency register` api and backend will follow below steps in api:
                  1. Check whether the `cognitoUserId` present in `aws cognito user pool` or not
                     1. If not found:
                        1. Throw an error
                     2. If found:
                        1. Compare the api request body `email` and `cognitoEmail` is same or not
                           1. If not same:
                              1. Throw forbidden error
                  2. Check whether the `invite` id is present or not
                     1. If not present:
                        1. Throw an error
                     2. If present:
                        1. Check whether the email in invite details and cognitoEmail is same or not
                           1. If not same:
                              1. Throw an error
                        
## Login
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
                  2. Check whether company details are present or not using `companyId`
                     1. If not found:
                        1. Throw error     
                  3. Check whether job details are present or not using `jobId`
                     1. If not found:
                        1. Throw error
                     2. If found:
                        1. Check whether the `companyId` in reqBody is same as `companyId` in `job details`
                           1. If not:
                              1. Throw error
                  4. Check whether this `companyJob` is assigned to this `agency` or not by using `JOB#ASGN#` and `COMP#{companyId}#AGCY#{agencyRegisteredEmail}#JOB#{jobId}#` in `AgencyJobAssignment` model
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









# Doubts
1. Agency Signup use cases
   1. let's say there is an employee account with `rohith123@gmail.com`
      whenever a corporate invites an agency with `rohith123@gmail.com`  as invite email,
      We need to throw an error by saying it already have an employee account so please use a different email
   2. let's say there is an agency invite with `sarvesh345@gmail.com` but `sarvesh345@gmail.com` did not registered yet
      1. whenever the same user `sarvesh345@gmail.com` tried to signup as candidate or employee  then
      should we need to throw any error ?? 
         1. if we allow `sarvesh345@gmail.com` to register to `candidate` or `employee` dashboard
         then if he again come and try to signup with the `agency invite email` recieved to him then it will become a conflict
   3. let's say there is an agency invite with `rohith@amazon.com` but `rohith@amazon.com` did not registered yet
      1. whenever the same email `rohith@amazon.com` is used by a `corporate` to send a `corporate invite`, should we throw an error by saying `its already have an agenecy invite`
         1. if we allow `rohith@amazon.com` to register to `corporate` dashboard
         then if he again come and try to signup with the `agency invite email` recieved to him then it will become a conflict
   4. Let's say sarvesh and ranganayaki are corporate recruiters in worko with byjus company
      1. sarvesh invited an agency ashutosh and ashutosh successfully registered as an agency
      2. ranganayaki tried to invite ashutosh again as an agency, so we should throw an error right ??
