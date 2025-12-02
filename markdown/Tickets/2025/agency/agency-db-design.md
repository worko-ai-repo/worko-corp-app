
### AgencyUserInvite
```ts
interface AgencyUserInvite {
  // Keys
  PK: `COMP#ID#${string}`; // companyId
  SK: `AGCY#INVT#${string}#ID#${string}`; // email#id
  GSI1PK: "AGCY#";
  GSI1SK: `INVT#${string}#COMP#${string}#ID#${string}`; // email#companyId#id
  
  // Attributes
  id: string;
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

### AgencyUser
```ts
interface AgencyUser {
  // Keys
  PK: `AGCY#EML#${string}`; // agencyRegisteredEmail
  SK: `ID#${string}`; // id
  GSI1PK: "AGCY#";
  GSI1SK: `ID#${string}`; // id
  
  // Attributes
  id: string;
  cognitoUserId: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  phoneNumberDetails: object;
  inviteIds: string[];
}
```

### AgencyJobAssignment
```ts
interface AgencyJobAssignment {
  // Keys
  PK: `AGCY#EML#${string}`; // agencyRegisteredEmail
  SK: `JOB#ASGN#ID#${string}`; // id
  GSI1PK: "JOB#ASGN#";
  GSI1SK: `COMP#${string}#AGCY#${string}#JOB#${string}#ID#${string}`; // companyId#agencyRegisteredEmail#jobId#id
  
  // Attributes
  id: string;
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

### AgencyUserSubmission
```ts
interface AgencyUserSubmission {
  // Keys
  PK: `AGCY#EML#${string}`; // agencyRegisteredEmail
  SK: `USR#SUBM#ID#${string}`; // id
  GSI1PK: "USR#SUBM#";
  GSI1SK: `COMP#${string}#AGCY#${string}#JOB#${string}#ID#${string}`; // companyId#agencyRegisteredEmail#jobId#id
  GSI2PK: `USR#EML#${string}`; // candidateEmail
  GSI2SK: `COMP#${string}#AGCY#${string}#JOB#${string}#ID#${string}`; // companyId#agencyRegisteredEmail#jobId#id
  
  // Attributes
  id: string;
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

### CandidateProfile
```ts
interface CandidateProfile {
  // Keys
  PK: `USR#EML#${string}`; // candidateEmail
  SK: `COMP#ID#${string}#ID#${string}`; // companyId#id
  GSI1PK: "REF#";
  GSI1SK: `TYPE#${string}#ID#${string}`; // refereeType#id
  GSI2PK: `COMP#ID#${string}`; // companyId
  GSI2SK: `TYPE#${string}#ID#${string}`; // refereeType#id
  
  // Attributes
  id: string;
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

### CandidateCvParsed
```ts
interface CandidateCvParsed {
  // Keys
  PK: `USR#EML#${string}`; // candidateEmail
  SK: `CV#PARSE#ID#${string}`; // id
  GSI1PK: "CV#PARSE#";
  GSI1SK: `ID#${string}`; // id
  
  // Attributes
  id: string;
  userId?: string;
  name: string;
  email: string;
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
}
```
