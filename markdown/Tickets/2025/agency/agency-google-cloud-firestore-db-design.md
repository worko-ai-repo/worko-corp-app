# Agency Google Cloud Firestore Database Design

### AgencyUserInvites Collection
**Collection Path:** `agencyUserInvites`
```ts
interface AgencyUserInvite {
  // Document ID: auto-generated or custom
  id: string;
  
  // Core Attributes
  invitedByCorporateUserId: string;
  updatedByCorporateUserId?: string;
  companyId: string;
  name: string;
  inviteStatus: string;
  email: string;
  phoneNumberDetails: object;
  GSTIN?: string;
  contractCopyAwsS3FileName?: string;
  contractCopyUserFileName?: string;
  createdAt: string;
  updatedAt: string;
}
```
**Composite Indexes:**
- `↓companyId` + `↓invitedByCorporateUserId` + `↓inviteStatus` 
- `↓email` + `↓companyId` + `↓inviteStatus`  
- `↓companyId` + `↓inviteStatus`





### AgencyUsers Collection
**Collection Path:** `agencyUsers`
```ts
interface AgencyUser {
  // Document ID: user email or auto-generated
  id: string;
  
  // Core Attributes
  cognitoUserId: string;
  email: string; // Used as document ID for direct lookup
  name: string;
  createdAt: string;
  updatedAt: string;
  phoneNumberDetails: object;
  inviteIds: string[];
}
```


### AgencyJobAssignments Collection
**Collection Path:** `agencyJobAssignments`
```ts
interface AgencyJobAssignment {
  // Document ID: auto-generated
  id: string;
  
  // Core Attributes
  companyId: string;
  jobId: string;
  assignedByCorporateUserId: string;
  createdAt: string;
  updatedAt: string;
  agencyUserId: string;
  agencyRegisteredEmail: string;
  status: string;
}
```
**Composite Indexes:**
- `↓agencyRegisteredEmail` + `↓status` + `↓companyId`



### AgencyUserSubmissions Collection
**Collection Path:** `agencyUserSubmissions`
```ts
interface AgencyUserSubmission {
  // Document ID: auto-generated
  id: string;
  
  // Core Attributes
  companyId: string;
  jobId: string;
  agencyUserId: string;
  createdAt: string;
  updatedAt: string;
  agencyRegisteredEmail: string;
  agencyJobAssignmentId: string;
  agencyJobAssignedByCorporateUserId: string;
  candidateParsedCvId: string;
  candidateEmail: string;
  agencyName: string;
  agencyUserInviteId: string;
  agencyComments: string;
  agencyJobAssignedByUserId?: string;
  userDetailId?: string;
}
```
**Composite Indexes:**




### CandidateProfiles Collection
**Collection Path:** `corporateCandidateProfiles`
```ts
interface CandidateProfile {
  // Document ID: auto-generated
  id: string;
  
  // Core Attributes
  candidateEmail: string;
  companyId: string;
  jobId?: string;
  refereeType: string;
  createdAt: string;
  updatedAt: string;
  candidateCvParsedId: string;
  agencyUserSubmissionId?: string;
}
```
**Composite Indexes:**




### CentralCandidateProfiles Collection
**Collection Path:** `centralCandidateProfiles`
```ts
interface CentralCandidateProfile {
  // Document ID: candidate email (for direct lookup)
  id: string; // candidateEmail
  
  // Core Attributes
  candidateEmail: string;
  phoneNumberDetails: {
    number: number; // 9666308100
    countryCode: number; // 91
  };
  
  // Admin Dashboard Requirements
  candidateProfileInCompanies: {
    companyId: string;
    jobIds?: string[];
    companyName: string;
  }[]; // Company names where profile exists, ex:- "Swiggy", "Zomato"

  /**
   * @todo: Ask `Product manager`
   */
  addedBy: string; 

  /**
   * @todo: Ask `Product manager`
   */
  addedFor: string; // Latest job/company it was added for

  /**
   * @todo: Need to ask detailed flow to `Product manager`
   */
  coolingPeriodCompanies: string[]; // Company names in cooling period

  createdAt: string;
  updatedAt: string;

  userDetailId?: string;
  
  // CV references (latest 3)
  candidateCvHistory: {
    candidateCvParsedId: string;
    cvAwsS3FileName: string;
    uploadedAt: string;
  }[]; // Max 3 entries, sorted by uploadedAt desc
}
```



### CandidateCvParsed Collection
**Collection Path:** `candidateCvParsed`
```ts
interface CandidateCvParsed {
  // Document ID: auto-generated
  id: string;
  
  // Core Attributes
  userId?: string;
  name: string;
  email: string; // Candidate email
  phoneNumberDetails: object;
  currentCompany: string;
  currentDesignation: string;
  totalYOE: number;
  relevantYOE: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: number;
  location: string;
  readyToRelocate: boolean;
  cvAwsS3FileName: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}
```
**Composite Indexes:**
