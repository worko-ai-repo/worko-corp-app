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
                           1. FE will call `agency register` api and backend will follow below steps in api:[244-row-in-FrontendApiIntegration-Excelsheet]
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