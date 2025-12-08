
1. when `Edit` button is clicked then Update `agencyName` or `phoneNumberDetails`
   [PATCH] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-invite/corp-action`
   ```json
   // Request Body
   {
   "agencyInviteId": "01KBCQHF7BGMA8NGBZE4T16W9K",
   "agencyName": "APP SO BHARAT BHAAI",
   }
   ```


2. Remove jobs api flow:
   1. List the job assignments by `corporate`
      [GET] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-job-assignment?agencyRegisteredEmail=rohithappala777%2Bagencyinviteone%40gmail.com&status=ACTIVE&companyId=01JWAQF1G96E0SE9XHXSFGHNWW&assignedByCorporateUserId=21GCPHNR5HE10D0S8YSMZGS63H&searchText=developer`
   2. 
      [PATCH] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/agency-job-assignment/bulk/remove-jobs`
      ```json
      {
         "agencyJobAssignmentIdsToRemove": ["string"],
         "agencyUserInviteId": "string"
      }
      ```