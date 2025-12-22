
# Agency Bulk CV Check Feature Design

## Overview
Implementation of bulk CV check feature for agency dashboard, allowing agencies to perform bulk CV screening for different companies. Unlike corporate dashboard where users are tied to specific companies, agency users sign in with email and can work with multiple companies.

## Database Design

### Firestore Collections

#### 1. `agencyVulkJds` Collection
```typescript
interface AgencyBulkJdDb {
  id: string; // document ID
  createdAt: number;
  updatedAt: number;
  createdByAgencyUserId: string; 
  
  // Job details
  companyId: string;
  jobDescription: string;
  jobTitle: string;
  jobLocation?: string;
  mustHaveSkills?: string[];
  mustNotHaveSkills?: string[];
  goodToHaveSkills?: string[];
  coreSkills?: string[];
  softSkills?: string[];
  technicalSkills?: string[];
  industryPreferences?: string[];
  experienceRange?: { min: number; max: number };
  resumesCount: number;
}
```

#### 2. `agencyBulkJdResumes` Collection
```typescript
interface DbAgencyBulkJdResumeDto {
  id: string;
  createdAt: number;
  updatedAt: number;
  
  // References
  agencyBulkJdId: string;
  companyId: string;
  createdByAgencyUserId: string;
  
  // File details
  userFileName: string;
  cloudFileName: string;
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  
  // CV analysis results (populated by Lambda)
  cvExtractedParsed?: {
    candidateName?: string;
    candidateEmail?: string;
    candidatePhoneNumber?: string;
    candidateCurrentCompany?: string;
    candidateCurrentDesignation?: string;
    candidateExperience?: number;
    candidateLocation?: string;
  };
  matchingScore: number;
  scoreDetails?: string;
  rejectionFeedbackBySystem?: string;
}
```

### Firestore Composite Indexes

#### For `agencyBulkJds` collection:
```javascript
// Index 1: Query by agency user
{
  collectionGroup: 'agency-bulk-jd',
  fields: [
    { fieldPath: 'createdByAgencyUserId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}

// Index 2: Query by company
{
  collectionGroup: 'agency-bulk-jd',
  fields: [
    { fieldPath: 'companyId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

#### For `agency-bulk-jd-resume` collection:
```javascript
// Index 1: Query by agency bulk JD
{
  collectionGroup: 'agency-bulk-jd-resume',
  fields: [
    { fieldPath: 'agencyBulkJdId', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}

// Index 2: Query by agency user and status
{
  collectionGroup: 'agency-bulk-jd-resume',
  fields: [
    { fieldPath: 'createdByAgencyUserId', order: 'ASCENDING' },
    { fieldPath: 'processingStatus', order: 'ASCENDING' },
    { fieldPath: 'createdAt', order: 'DESCENDING' }
  ]
}
```

## API Design

### Base Routes
- `/agency-bulk-jd` - Job description management
- `/agency-bulk-jd-resume` - Resume management

### Endpoints

#### 1. Create Agency Bulk JD
```
POST /agency-bulk-jd
Authorization: Bearer {agency-user-token}
Content-Type: application/json

Request Body:
{
  "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
  "jobDescription": "Company Overview.....",
  "jobTitle": "full stack web developer",
  "jobLocation": "Indore, Madhya Pradesh, India",
  "mustHaveSkills": ["React.js", "Node.js"],
  "mustNotHaveSkills": ["api"],
  "goodToHaveSkills": ["Microfrontend Architecture"],
  "coreSkills": ["Full Stack Development"],
  "softSkills": ["Leadership"],
  "technicalSkills": ["React.js", "Jest"],
  "industryPreferences": ["beverage"],
  "experienceRange": { "min": 0, "max": 1 }
}

Response (201):
{
  "id": "01KCV4159CT7SH8FN14TSPNMN2",
  "createdAt": 1766141760816,
  "updatedAt": 1766141760816,
  "createdByAgencyUserId": "agency-user-cognito-id",
  "resumesCount": 0,
  ...requestBody
}
```

#### 2. Upload CVs for Agency Bulk JD
```
POST /agency-bulk-jd/{agencyBulkJdId}/resumes
Authorization: Bearer {agency-user-token}
Content-Type: application/json

Request Body:
{
  "agencyBulkJdId": "01KCV4159CT7SH8FN14TSPNMN2",
  "bulkCvs": [
    {
      "userFileName": "candidate1.pdf",
      "cloudFileName": "01KCV415Q1GB7EFCDZVH55ZA24.pdf",
      "fileMimeType": "application/pdf",
      "fileExtension": "pdf"
    }
  ]
}

Response (201):
{
  "agencyBulkJdId": "01KCV4159CT7SH8FN14TSPNMN2",
  "bulkCvs": [
    {
      "userFileName": "candidate1.pdf",
      "cloudFileName": "01KCV415Q1GB7EFCDZVH55ZA24.pdf",
      "fileMimeType": "application/pdf",
      "fileExtension": "pdf",
      "awsS3SignedUrl": "https://worko-agency-dev.s3.ap-south-1.amazonaws.com/agencies/{agencyUserId}/bulk-cvs/{agencyBulkJdId}/01KCV415Q1GB7EFCDZVH55ZA24.pdf?..."
    }
  ],
  "bulkCvsStorageFailed": []
}
```

#### 3. Get Agency Bulk JDs
```
GET /agency-bulk-jd?limit=10&sortOrder=desc&fromDate=1766000000000&toDate=1766999999999&searchText=developer
Authorization: Bearer {agency-user-token}

Response (200):
{
  "data": [
    {
      "id": "01KCV4159CT7SH8FN14TSPNMN2",
      "jobTitle": "full stack web developer",
      "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
      "createdAt": 1766141760816,
      "resumesCount": 5,
      ...
    }
  ],
  "pagination": {
    "limit": 10,
    "hasMore": false,
    "totalCount": 1
  }
}
```

#### 4. Get Agency Bulk JD by ID
```
GET /agency-bulk-jd/{id}
Authorization: Bearer {agency-user-token}

Response (200):
{
  "id": "01KCV4159CT7SH8FN14TSPNMN2",
  "jobTitle": "full stack web developer",
  "jobDescription": "Company Overview.....",
  "companyId": "01JWAQF1G96E0SE9XHXSFGHNWW",
  "createdByAgencyUserId": "agency-user-cognito-id",
  "resumesCount": 5,
  ...
}
```

#### 5. Get Agency Bulk JD Resumes
```
GET /agency-bulk-jd-resume?agencyBulkJdId=01KCV4159CT7SH8FN14TSPNMN2&processingStatus=COMPLETED&limit=10
Authorization: Bearer {agency-user-token}

Response (200):
{
  "data": [
    {
      "id": "resume-id-1",
      "agencyBulkJdId": "01KCV4159CT7SH8FN14TSPNMN2",
      "userFileName": "candidate1.pdf",
      "processingStatus": "COMPLETED",
      "matchingScore": 85,
      "cvExtractedParsed": {
        "candidateName": "John Doe",
        "candidateEmail": "john@example.com",
        "candidateExperience": 3
      },
      "createdAt": 1766141760816
    }
  ],
  "pagination": {
    "limit": 10,
    "hasMore": false,
    "totalCount": 5
  }
}
```

## S3 Storage Structure

```
worko-agency-dev/
└── agencies/
    └── {agencyUserId}/
        └── bulk-cvs/
            └── {agencyBulkJdId}/
                ├── {cloudFileName1}.pdf
                ├── {cloudFileName2}.pdf
                └── {cloudFileName3}.pdf
```

## API Call Flow

### 1. Create Bulk JD Flow
```
Frontend → POST /agency-bulk-jd → Firestore (agency-bulk-jd collection)
```

### 2. Upload CVs Flow
```
Frontend → POST /agency-bulk-jd/{id}/resumes 
         → Generate S3 signed URLs
         → Save to Firestore (agency-bulk-jd-resume collection)
         → Return signed URLs to frontend
         → Frontend uploads files to S3
         → S3 triggers Lambda for CV processing
```

### 3. CV Processing Flow (Lambda)
```
S3 Upload Event → Lambda Function → CV Extraction & JD Matching 
                → Update Firestore (agency-bulk-jd-resume) with results
                → Update resumesCount in agency-bulk-jd
```

## Authentication & Authorization

### User Groups
- `agency-user` - Agency dashboard users
- `admin` - Worko admin users

### Authorization Logic
```typescript
// In controller
const cognitoUserId = global.requestLocalContext.userId;
const cognitoUserGroups = global.requestLocalContext.cognitoUserGroups;

if (cognitoUserGroups.includes('agency-user')) {
  createdByAgencyUserId = cognitoUserId;
} else if (cognitoUserGroups.includes('admin')) {
  createdByUserId = cognitoUserId;
} else {
  throw new BaseError("Unauthorized", 403);
}
```

## Data Filtering

### Agency User Filtering
- Agency users can only see their own bulk JDs: `createdByAgencyUserId = {currentUserId}`
- Admin users can see all bulk JDs

### Query Examples
```typescript
// Get agency user's bulk JDs
const bulkJds = await firestore
  .collection('agency-bulk-jd')
  .where('createdByAgencyUserId', '==', agencyUserId)
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();

// Get resumes for specific bulk JD
const resumes = await firestore
  .collection('agency-bulk-jd-resume')
  .where('agencyBulkJdId', '==', bulkJdId)
  .where('createdByAgencyUserId', '==', agencyUserId)
  .orderBy('createdAt', 'desc')
  .get();
```

## Key Differences from Corporate Implementation

| Aspect | Corporate | Agency |
|--------|-----------|---------|
| Database | DynamoDB | Firestore |
| User Scope | Company-specific | Multi-company |
| S3 Path | `/companies/{companyId}/` | `/agencies/{agencyUserId}/` |
| Auth Field | `createdByCorporateUserId` | `createdByAgencyUserId` |
| Filtering | By `companyId` | By `createdByAgencyUserId` |

## Implementation Checklist

- [ ] Create Firestore collections with proper indexes
- [ ] Implement API endpoints with proper authentication
- [ ] Set up S3 bucket structure for agencies
- [ ] Configure Lambda function for CV processing
- [ ] Update frontend to handle agency-specific flows
- [ ] Add proper error handling and validation
- [ ] Implement pagination for large datasets
- [ ] Add monitoring and logging