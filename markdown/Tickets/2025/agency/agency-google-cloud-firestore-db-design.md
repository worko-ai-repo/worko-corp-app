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
- `companyId` + `invitedByCorporateUserId` + `inviteStatus`
- `email` + `inviteStatus` + `companyId`
- `companyId` + `inviteStatus`





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
**Composite Indexes:**
- `email` (single field index for direct lookup)
- `cognitoUserId` (single field index)




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
- `companyId` + `agencyRegisteredEmail` + `jobId`
- `agencyRegisteredEmail` + `status`
- `jobId` + `status`




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
  candidateCvParsedId: string;
  candidateEmail: string;
}
```
**Composite Indexes:**
- `companyId` + `agencyRegisteredEmail` + `jobId`
- `candidateEmail` + `companyId` + `jobId`
- `agencyRegisteredEmail` + `createdAt`




### CandidateProfiles Collection
**Collection Path:** `candidateProfiles`
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
- `candidateEmail` + `companyId`
- `companyId` + `refereeType`
- `refereeType` + `createdAt`




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
