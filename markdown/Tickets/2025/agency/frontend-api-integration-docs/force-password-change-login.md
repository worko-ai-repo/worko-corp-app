



1. Whenever `move to applicant` button is clicked if the `candidate` is `unregistered` user in backend we Creating Candidate in `cognito`, we create as `unverified` email and status as `Force change password`
2. Candidate will recieve force change password reminder with email and `temporary password` which we created and candidate will be redirected to `login` page once he recieves `email` and `temporary password` to candidate
3. After user enters `email` and `temporary password` Frontend will recieve challenge name as `"ChallengeName": "NEW_PASSWORD_REQUIRED"`
4. Now Frontend will call below backend nodejs api to send `otp` to candidate via candidate email:
   [POST] `https://api.dev.worko.work/user/request-otp/force-change-password`
   ```json
   // Request payload
   {
    "candidateRegisteredEmail": "rohithappala999+cand10@gmail.com"
   }
   ```
   ```json
   // Response
   // 200 OK
   {
    "id": "01KBQ8AHGMCM91M8NHGJ040BDY"
   }
   ```
5. Candidate will enter and submit the `otp` and Frontend will call below api to verify his email:
   [POST] `https://api.dev.worko.work/user/verify-otp/force-change-password`
   ```json
   // Request Payload
   {
    "candidateRegisteredEmail": "rohithappala999+cand10@gmail.com",
    "otp":"414536"
   }
   ```
   ```json
   // Response
   // 200 OK 
   {
    "verificationStatus": true
   }
   ```
6. Then now `Frontend` will show a `dialog` box with `new password` and `confirm password` to  for `candidate` and in `cognito` the status will changes to `CONFIRMED`