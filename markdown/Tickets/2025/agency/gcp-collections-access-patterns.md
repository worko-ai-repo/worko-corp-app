
# agencyUserSubmissions
## Access patterns 
### Agency Dashboard
#### Applicants Page
   1. Whenever agency lands to applicants page below is the access pattern used mandatorily
      [GET] `{baseUrl}?agencyRegisteredEmail=rohithappala777%2Bagencyinviteone%40gmail.com&pageSize=10&sortOrder=desc`
   2. Optional filters:
      1. by `companyId` or `jobId` or both 
         [GET] `{baseUrl}?agencyRegisteredEmail=rohithappala777%2Bagencyinviteone%40gmail.com&companyId=4E5DTRYCGV6DYTCV&jobId=5EDTYCGD5YTC&pageSize=10&sortOrder=desc`
   3. Composite indexes:
      - agencyRegisteredEmail + createdAt
      - agencyRegisteredEmail + companyId + createdAt
      - agencyRegisteredEmail + jobId + createdAt
      - agencyRegisteredEmail + companyId + jobId + createdAt
### Corporate Dashboard
#### Agency: All Candidates Page
   1. Whenever `corporate-admin/recruiter` lands to this particular page then below is the access pattern used mandatorily
      [GET] `{baseUrl}?companyId=01JWAQF1G96E0SE9XHXSFGHNWW&agencyJobAssignedByCorporateUserId=21GCPHNR5HE10D0S8YSMZGS63H&pageSize=10&sortOrder=desc`
   2. Optional filters: by `candidateEmail` or `jobId` or `agencyName` or all
      [GET] `{baseUrl}?companyId=01JWAQF1G96E0SE9XHXSFGHNWW&jobId=EUD6RTJFYCGHDYTCGVH&agencyJobAssignedByCorporateUserId=21GCPHNR5HE10D0S8YSMZGS63H&candidateEmail=rohithappala999%2Bcand15%40gmail.com&agencyName="APP SOW"&pageSize=10&sortOrder=desc`
   3. Composite indexes:
      - companyId + agencyJobAssignedByCorporateUserId + createdAt
      - companyId + agencyJobAssignedByCorporateUserId + candidateEmail + createdAt
      - companyId + agencyJobAssignedByCorporateUserId + jobId + createdAt
      - companyId + agencyJobAssignedByCorporateUserId + agencyName + createdAt
      - companyId + agencyJobAssignedByCorporateUserId + jobId + candidateEmail + agencyName + createdAt
### Admin Dashboard
#### Agency: All Candidates Page
   1. Whenever `worko-admin` lands to this particular page then below api is being called
      [GET] `{baseUrl}?pageSize=10&lastKey=&sortOrder=desc`
   2. by `companyId` or `jobId` or `candidateEmail` or `agencyName` or all
      [GET] `{baseUrl}?companyId=01JWAQF1G96E0SE9XHXSFGHNWW&jobId=EUD6RTJFYCGHDYTCGVH&candidateEmail=rohithappala999%2Bcand15%40gmail.com&agencyName="APP SOW"&pageSize=10&sortOrder=desc`
   3. Composite indexes:
      - companyId + createdAt
      - jobId + createdAt
      - candidateEmail + createdAt
      - agencyName + createdAt
      - companyId + jobId + createdAt
      - companyId + candidateEmail + createdAt
      - companyId + agencyName + createdAt
      - companyId + jobId + candidateEmail + agencyName + createdAt