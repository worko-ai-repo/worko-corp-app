
1. Create lambda function for agency
   1. worko-agency-bulk-jd-resume-matching-dev
   2. worko-agency-bulk-jd-resume-matching-prod
2. S3 Trigger for `worko-agency-bulk-jd-resume-matching-dev` lambda
   ```sh
      `agencies/{agencyUserId}/bulk-cvs/{agencyBulkJdId}`
      # Example destination
      # s3://worko-app-dev/agencies/712EEWMW5HE3NE9K8DGRXXTR53/bulk-cvs/01KD2W640HJS9PZNJMHNH6YE6K/01KD2WDTS7RZKEJ6QFK87MDC0K.pdf
   ```
3. Update below things in `agencyBulkJdResumes` Firestore Collection: 
```ts
{
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
```