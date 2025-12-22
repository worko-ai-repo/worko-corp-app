


# Existing bulk cv check in `corporate dashboard`
1. 
Request URL `https://api.dev.worko.work/corporate-bulk-jd/`
Request Method `POST`
```json
{
   "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
   "jobDescription": "Company Overview.....",
   "jobTitle": "full stack web developer",
   "jobLocation": "Indore, Madhya Pradesh, India",
   "mustHaveSkills": [
      "React.js",
      "Node.js",
   ],
   "mustNotHaveSkills": [
      "api"
   ],
   "goodToHaveSkills": [
      "Microfrontend Architecture",
      "Trading Systems"
   ],
   "coreSkills": [
      "Full Stack Development",
      "Web Application Architecture",
      "SEO Optimization"
   ],
   "softSkills": [
      "Leadership",
      "Innovation"
   ],
   "technicalSkills": [
      "React.js",
      "Jest"
   ],
   "industryPreferences": [
      "beverage"
   ],
   "experienceRange": {
      "min": 0,
      "max": 1
   },
   "createdByCorporateUserId": "21GCPHNR5HE10D0S8YSMZGS63H",
   "PK": "COMP#ID#01JWAQF1G96E0SE9XHXSFGHNWW",
   "SK": "BJDRM#JD#ID#01KCV4159CT7SH8FN14TSPNMN2",
   "id": "01KCV4159CT7SH8FN14TSPNMN2",
   "GSI1PK": "BJDRM#JD#",
   "GSI1SK": "ID#01KCV4159CT7SH8FN14TSPNMN2",
   "createdAt": 1766141760816,
   "updatedAt": 1766141760816,
   "resumesCount": 0
}
```

2. 
Request URL `https://api.dev.worko.work/corporate-bulk-jd/01KCV4159CT7SH8FN14TSPNMN2/resumes`
Request Method `POST`
```json
{
    "corporateBulkJdId": "01KCV4159CT7SH8FN14TSPNMN2",
    "bulkCvs": [
        {
            "userFileName": "42.pdf",
            "cloudFileName": "01KCV415Q1GB7EFCDZVH55ZA24.pdf",
            "fileMimeType": "application/pdf",
            "fileExtension": "pdf",
            "awsS3SignedUrl": "https://worko-corporate-dev.s3.ap-south-1.amazonaws.com/companies/01JWAQF1G96E0SE9XHXSFGHNWW/bulk-cvs/01KCV4159CT7SH8FN14TSPNMN2/01KCV415Q1GB7EFCDZVH55ZA24.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=REDACTED_SECRET%2F20251219%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251219T105601Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEOP%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiRzBFAiADmwYeOq%2FyaUCJg9%2BXfrBXprMRxPq2Z03WsBbcjvoYnQIhAKoiE529dbPBe%2BMNSyFUnM5PMTGnx0CUVDxx5kI8fAuwKoADCKz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMMjExMTI1MzUzODk5IgziTRbZOHjwlfmeYJYq1AIdWnTkOHhu0YZHZN6%2BK8mPGLhnbGROIboegnmIUq5LCb32hezN2%2Fybu9gmlOW8A6rlaetjJmeHWn8wgUUqVzMA58o8aqXNwn5A6ZjODuU%2Bb2yQszk4fH%2BRpccsM%2FGor9Odad6Z0E8UFRf5xMXLletvngVYOhrgDzj7VnYO8v%2FXXFLq1FWVpCCS7OkhiUALGkJKBVgrZITT4Ls9MqmmVjIIBpJkUbDk4rbiL%2Bv8TtA9tQfObMJ4eKbVJKWtgSZ1c7jcjCfoaazXYkDVKQOHYPtW%2BqaNKeJPbT2DOz9%2B%2FFIDGZcVY9Yz6w2a83MXVe7eqR6BTSyTOyjczVzkocNW8uTxAvW3gOrw7l2XvC63ndnTmxVvcvuVzsXPc7qjU2ypGL1LBamZBZ8Jkmu1XS6WKWyZrG%2BIEwCQzEfKnblhNmwXa3p23TLxEbczpBy1FP9km%2FykLTmOMLzelMoGOp4BQzHLZtLDAcYr%2BqxSbLE8L%2FaaG5VABsiDeO22%2FIYDDnvRl2d5G%2F4oCQwV3HHOtHGdAYBVoY4%2Fn%2BH8k9kXlnvP4sxH64EI6ELV0QJKkGa53P%2FjSeGzvex46kFgM52hKzGqFH7c%2Bxti%2FsUlcEN4rzWa%2BLVae1VrnKiQQfF2cbLDEYPSRXqwiB3uiRFJ7%2BsHuWArppLJN2Jt1mnMWfA5S%2Bw%3D&X-Amz-Signature=067f95baa3c90cd1f43a70b7ed99d6e198ed040c50aba9a416c705ede1db0d96&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject"
        }
    ],
    "bulkCvsStorageFailed": []
}
```



# Prompt
```sh
Understand the below apis and responses entirely entirely
and understand the code from the api endpoint starting from `router.ts`, controllers, services, ... every code in api flow with dynamodb database

We have `agency Dashboard` and below is schema in firestore:
```ts
{
  /**
   * @description It should be same as the "document ID" of the firestore document.
   */
  id: string;
  createdAt: string;
  updatedAt: string;
  cognitoUserId: string;
  email: string;
  name: string;
  phoneNumberDetails: AgencyUserDbPhoneNumberDto;

  /**
   * @reference `id` field of `AgencyUserInvite.model.ts`
   */
  inviteIds: string[];

  /**
   * @description If email is verified in cognito then this will be `true`, otherwise `false`
   * @reference "Email verified" column in "Amazon Cognito > User pools > {YourUserPoolName} > Users"
   */
  isEmailVerified: boolean;
}
```

now i want to implement this bulk cv check feature in agency dashboard, like agency will perform bulk cv check feature from different companies and
in `corporate dashboard` they loggin with kind of attached company only, but agency will signin with email and
we want to list only whatever the agency performed the bulk cv check

and give me `composite indexes` in firestore accordingly and give me api design, db design, api call order flow, s3 paths, everything by comparing with existing `bulk cv check`
```








