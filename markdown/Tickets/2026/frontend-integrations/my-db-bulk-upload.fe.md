

1. Corporate dashboard bulk upload
   [POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/corporate-candidate-profile/resumes`
   ```json
   // Request body
   {
      "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
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
               "cloudFileName": "01KEGVXGGFZ1D9XTCG07T03AXT.pdf",
               "fileMimeType": "application/pdf",
               "fileExtension": "pdf",
               "awsS3SignedUrl": "https://worko-corporate-cand-profile-dev.s3.ap-south-1.amazonaws.com/companies/01JWAQF1G96E0SE9XHXSFGHNWW/bulk-cvs/01KEGVXGGFZ1D9XTCG07T03AXT.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=REDACTED_SECRET%2F20260109%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260109T075312Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiRzBFAiAmokM7qhYKIOfZg1BOUPbkzV0Af9ajdZqEMxUnuCcc2QIhAPz9jd2%2F9L6oguZWDJ8z1g2xrDqn7nETGaATAWKKCLl7Ko4DCKH%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMMjExMTI1MzUzODk5IgxTn%2FcxY3Tu%2BGfkLEsq4gJjNxelV1TTFX%2F0rHGYo0c5QubYcnH%2F9MogSdCHM7hVJ87hwN6hwWfN6Wtc%2B1oofEjVvV%2FbTYdKC5dyCJcitIPT1%2BPwObgLc9l6zfg94YAJZvb5s%2FghxY%2BlVKX9s32%2FplCp6aYDPhgUrXJ6eVRh1uHCZGZkXrLB%2F72Co5J39zK20mo277xdgzYQs7jbEGq4Eu2fksKnQHFbSyyAf8D5dxx6%2FnfNHzmD7DcIh11nRSixxxRYCe3ZhOUs34lM0qOKCKwUDxOh0l4pFl6slqRg5jqCF7PzcOj1UKnbhPvS3OJWBcMPCv3GR8YHpSLB%2BZO8E%2B1ahhL5fNIK2q8KqWJKFRjJd4tc5lrI4i3LsI%2FLVDlxrEyTd%2FCtS51ZtDiDDlsv3tlUQELCKVcLOHYzzEcV4iG3bnPscz4FEK2axkLr%2BGzeDmzg3aSTH3%2BMHdhsm2idbhIGz4dvaMLjcrDyFU16hm%2FN7uYw%2FeaCywY6ngGAZqFK32%2BDAG526LQFbiHFi2ZgCoA7Nw7Q72dkRPNfgHA2bFu8RX3CRPVC6nV9h1uH2Ng3zwqaIIOpa4CTHeUPHZOmJr4XjCfpoBvxj9mHw%2BSIFkkfn%2F0DaT0GXaqxwB0A62y95LI9tg%2FwUJ2sK5aLaOBL2TbDHz63l5LugwzpTVpFGOwO3m6NdXH4el7Mp39nr27c3DHSuUX%2BEuUl9g%3D%3D&X-Amz-Signature=0ecdff01a46835769fcb6982c8f025c274f48ab4dbc5f26cbbb9cb24fac9e93e&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
         }
      ]
   }
   ```

2. Admin dashboard bulk upload
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
               "cloudFileName": "01KEGZJSKBNPMHCPH7ZJNCH6EM.pdf",
               "fileMimeType": "application/pdf",
               "fileExtension": "pdf",
               "awsS3SignedUrl": "https://worko-admin-cand-profile-dev.s3.ap-south-1.amazonaws.com/bulk-cvs/01KEGZJSKBNPMHCPH7ZJNCH6EM.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=REDACTED_SECRET%2F20260109%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20260109T085715Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjENn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiRzBFAiAWeEYRh3bFiUWacPd%2B9YzsLeDd0yclh5uBesDaaD4XwQIhAKXxpU9QHlO9akVsgUKt5mRyMTg5j87s5G6Bu1p4JMz7Ko4DCKL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMMjExMTI1MzUzODk5IgxGpkaZ94aT6MF2Yjkq4gInR%2FwTIQGT9wvuUQ8lh74ZXf0%2FtfzY%2Bvg1K2eDxShVleN9WPh23QyFr%2BPmrn9%2FUGgNANHwa1JxxqsPB6VfodO%2Fz6%2FCWLjk7JSQZIcnApO6xOi2E0cUU3cySYxW2Uelo3MXp%2BTLqOSIXYN19g5yELMzkkgdN1oTlysLrd1s%2BHQ%2FdfRAls%2BFvZy5Lgp76nlZztvFYg0gYyKo8KmcgMt6cBqbShtabI1wmYyCJ0gBvd%2FgCDfqAXvfMdC0tG7XSB3vWbE243c%2Fm9UBRg%2FciWewLYu6p8WUWHC63zHF8H2%2BQsdPEas8PrPndRS4TcY0cmu4XXunMeaXfLc9cTQ6xYvqJmQuBtHkFoARtk8Rz1TGNPtIIudWO5pQ%2BCTBA55KK%2BqMu8jXmUdaBJMr%2BzCi3BwO16%2FaRNCZUgyuFS5QgVAfASJW%2BupPzMZ83X65s%2Fh4OTK3jv3EFNt60DXbw0%2BnCeFEbqi5QvAw4YWDywY6ngFwMss8IaRvTtuNygk3I4y4lSZ%2FypnLMcO1PEuoIHAS%2Bl6YHDV6Gu26bM924zp1zAQEovxpLHf0gLeObvtVVR%2Bqa1EV1OkHGEDpjWFHtqgY3RMKzvOKyyBBeuTt4K9ww5DVkblrrn7tyYsqfFbbcHZgsm46i3B6uCKBOpCiBFZqwuOJQw1mGPI55GrYtp%2FcdjLHw8IU%2FrRXuLLPrBIFpg%3D%3D&X-Amz-Signature=f85ef7f18c8989d1970a467b1a5e3891f5aa25edd29c820f950334f8285cda71&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
         }
      ]
   }
   ```

3. Corporate View uploaded cv using `Bulk Cv Upload` button
   [POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/file/gsu2v/CORP_CAND_BULK_CV_UPLOAD`
   ```json
   {
      "companyId": "corporate-registered-companyId",
      "candCvAwsS3FileName": "57RTFCG.pdf"
   }
   ```
   ```json
   {
      "objectUrl": "string"
   }
   ```

4. Admin View uploaded cv using `Bulk Cv Upload` button
   [POST] `https://bdwmxdaqll.execute-api.ap-south-1.amazonaws.com/dev/file/gsu2v/ADMIN_CAND_BULK_CV_UPLOAD`
   ```json
   {
      "candCvAwsS3FileName": "57RTFCG.pdf"
   }
   ```
   ```json
   {
      "objectUrl": "string"
   }
   ```