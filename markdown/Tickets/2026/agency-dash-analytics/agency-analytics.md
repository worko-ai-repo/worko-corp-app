# Agency Dashboard Analytics - Agency Performance Matrix

## 1) Business Goal

Build agency-focused analytics for corporate dashboard users to answer:

- Which agency is working on which role.
- How many candidates each agency has in key stages: submitted, in process, rejected, hired.
- Agency ranking buckets: top performer, medium, low, poor.

This document follows the structure and conventions used in `DashboardHome.md.txt`, but focuses only on agency-level performance.

---

## 2) Core Requirements

### 2.1 Agency Performance Matrix

For a selected company, show role-wise agency metrics:

- `agencyName`
- `roleId` / `roleTitle`
- `submittedCount`
- `inProcessCount`
- `rejectedCount`
- `hiredCount`
- `acceptedCount` (needed for ranking confidence)
- `lastActivityAt`

### 2.2 Agency Ranking

Rank agencies using weighted pipeline outcomes per selected date range:

- Primary ranking signals:
  - `acceptedCount`
  - `inProcessCount`
  - `hiredCount`
- Suggested score:
  - `score = (acceptedCount * 0.30) + (inProcessCount * 0.20) + (hiredCount * 0.50)`

Bucket output:

- `TOP_PERFORMER`
- `MEDIUM`
- `LOW`
- `POOR`

Suggested bucket thresholds (configurable):

- `TOP_PERFORMER`: score >= 75
- `MEDIUM`: score >= 45 and < 75
- `LOW`: score >= 20 and < 45
- `POOR`: score < 20

---

## 3) JSON Prompt For Implementation

```json
{
  "feature": "agency_dashboard_analytics",
  "module": "analytics",
  "objective": "Implement agency performance matrix and agency ranking for corporate dashboard",
  "scope": {
    "company_scoped": true,
    "date_range_supported": true,
    "filters": ["companyId", "agencyId", "roleId", "startDate", "endDate"]
  },
  "metrics": {
    "matrix": [
      "submittedCount",
      "inProcessCount",
      "rejectedCount",
      "hiredCount",
      "acceptedCount",
      "totalCandidates",
      "lastActivityAt"
    ],
    "ranking": {
      "signals": ["acceptedCount", "inProcessCount", "hiredCount"],
      "scoreFormula": "(acceptedCount * 0.30) + (inProcessCount * 0.20) + (hiredCount * 0.50)",
      "buckets": ["TOP_PERFORMER", "MEDIUM", "LOW", "POOR"]
    }
  },
  "api": {
    "basePath": "/analytics/agency",
    "endpoints": [
      "GET /analytics/agency/performance-matrix",
      "GET /analytics/agency/ranking",
      "GET /analytics/agency/performance-summary"
    ]
  },
  "responseContracts": {
    "performanceMatrixItem": {
      "agencyId": "string",
      "agencyName": "string",
      "roleId": "string",
      "roleTitle": "string",
      "submittedCount": "number",
      "inProcessCount": "number",
      "rejectedCount": "number",
      "hiredCount": "number",
      "acceptedCount": "number",
      "totalCandidates": "number",
      "lastActivityAt": "ISODateString"
    },
    "rankingItem": {
      "agencyId": "string",
      "agencyName": "string",
      "acceptedCount": "number",
      "inProcessCount": "number",
      "hiredCount": "number",
      "score": "number",
      "rankBucket": "TOP_PERFORMER|MEDIUM|LOW|POOR",
      "rankPosition": "number"
    }
  },
  "approaches": ["precomputed_partitioned_store"],
  "constraints": {
    "mustFollowExistingConventions": true,
    "mustReuseExistingEnumsAndAuthGuards": true,
    "externalPackagesRequireApproval": true,
    "schemaBreakingChangesNeedMigrationPlan": true,
    "ruleset": {
      "mandatoryJsDocForEveryNewMethod": true,
      "mandatoryJsDocForEveryNewFileExports": true,
      "importGroupingRequired": true,
      "importGroupsMustHaveComments": true,
      "importOrderWithinGroup": "A-Z",
      "implementationOrder": [
        "router",
        "schema",
        "dto",
        "controller",
        "service",
        "dao",
        "tests"
      ]
    }
  },
  "qualityBar": {
    "unitTests": ["ranking score calculation", "bucket assignment", "status mapping"],
    "integrationTests": ["company scoped authorization", "date range filters", "endpoint response contracts"],
    "performanceTarget": "P95 under 500ms for matrix endpoint"
  },
  "deliverables": [
    "controller + service + dto/schema updates",
    "approach documentation and trade-offs",
    "seed/backfill script plan for historical data",
    "monitoring and rollout checklist"
  ]
}
```

---

## 4) Do and Don't (Engineering Guardrails)

### Do

- Follow existing backend folder conventions (`controller`, `service`, `dto`, `schema`, `dao`) already used by analytics.
- Follow implementation order for this feature: `router -> schema -> dto -> controller -> service -> dao -> tests`.
- Reuse existing status enums and mapping strategy from job application flow.
- Enforce existing role-based access model (corporate user = company scoped, admin = multi-company with filters).
- Keep response contracts stable and backward compatible when adding new optional fields.
- Add JSDoc blocks for every new method and exported file-level contract.
  - Required style:
    - `/**`
    - ` * methodName`
    - ` *`
    - ` * Short purpose statement.`
    - ` *`
    - ` * @param ...`
    - ` * @returns ...`
    - ` */`
- Keep imports grouped with section comments, and sorted in A-Z order within each group.
  - Example group comments:
    - `// Node imports`
    - `// External package imports`
    - `// Internal absolute imports`
    - `// Relative imports`
- Add unit tests for scoring and bucket classification.
- Add integration tests for authorization and date range filtering.

### Don't

- Do not add external libraries/packages without explicit approval.
- Do not introduce schema-breaking changes without migration/backfill plan.
- Do not bypass existing auth middleware or company scoping checks.
- Do not hardcode status literals if enum/constants already exist.
- Do not add new methods/files without JSDoc.
- Do not keep ungrouped imports or unsorted imports.
- Do not run full table scans on high-cardinality tables in request path without pagination/index strategy.

---

## 5) Approach 1 - Firestore Aggregated Document (Write-Time Aggregation)

### 5.1 Summary

Persist precomputed agency analytics counters in Firestore as one document per unique `(companyId, agencyId, roleId)` and update counters on each relevant agency/candidate lifecycle event.

This approach gives faster read performance and stable dashboard latency.

### 5.2 Proposed Firestore Collection/Schema

Suggested collection model:

- Collection: `agencyAnalytics`
- Document ID format: `{companyId}_{agencyId}_{roleId}`
- Creation policy:
  - Create the document once on first event for a `(companyId, agencyId, roleId)` combination.
  - For all subsequent events, only increment/decrement/update fields in same document.

Suggested record schema:

```ts
interface CompanyAgencyRoleAnalytics {
  /** Company tenant identifier used for scoped analytics reads and writes. */
  companyId: string;

  /** Agency identifier for which the counters are maintained. */
  agencyId: string;

  /** Denormalized agency name to avoid lookup joins in dashboard reads. */
  agencyName: string;

  /** Role identifier (JD/position) that the agency is sourcing for. */
  roleId: string;

  /** Denormalized role title for lightweight presentation in matrix responses. */
  roleTitle: string;

  /** Total count of submitted candidates for this company-agency-role (lifetime or reset window based on job rule). */
  submittedCount: number;

  /** Total count of candidates moved into in-process stages. */
  inProcessCount: number;

  /** Total count of candidates marked rejected. */
  rejectedCount: number;

  /** Total count of candidates moved to hired status. */
  hiredCount: number;

  /** Total count of accepted candidates (accepted profile or accepted stage). */
  acceptedCount: number;

  /** Total unique candidates touched for this company-agency-role document. */
  totalCandidates: number;

  /** UTC timestamp when this document was first created (first event). */
  createdAt: string;

  /** Last UTC timestamp when counters were updated by any event. */
  updatedAt: string;

  /** Last event type processed (example: CANDIDATE_ADDED, CANDIDATE_HIRED). */
  lastEventType: string;

  /** Last event id for idempotency protection against duplicate processing. */
  lastEventId: string;
}
```

### 5.3 Event Touchpoints (Write Path Changes)

Below are implementation touchpoints to increment/decrement counters when candidate status changes.

- `src/modules/agency/agency.service.ts`
  - `addCandidate(...)`
  - On candidate creation: increment `submittedCount`, `totalCandidates`.
- `src/modules/agency/agency.service.ts`
  - `updateCandidateStatus(...)`
  - Status transitions:
    - to `IN_PROCESS`: increment `inProcessCount`.
    - to `REJECTED`: increment `rejectedCount`.
    - to `HIRED`: increment `hiredCount`.
    - to `ACCEPTED`: increment `acceptedCount`.
  - If status is mutable and can move between buckets, decrement old bucket and increment new bucket in same transaction/unit-of-work.
- `src/modules/candidate/candidate.service.ts`
  - `moveCandidateStage(...)` or equivalent stage updater
  - Keep analytics sync by publishing analytics event or direct analytics updater call.
- `src/modules/analytics/agency-analytics-updater.service.ts` (new)
  - `applyAgencyAnalyticsDelta(deltaPayload)`
  - Centralized updater for all write-time increments/decrements.

### 5.4 Historical Backfill Script

Create a post-development script to seed historical counters by upserting into one document per `(companyId, agencyId, roleId)`:

- Script: `scripts/analytics/backfill-agency-analytics.ts`
- Inputs:
  - `companyId` (optional)
  - `fromDate`, `toDate`
  - `dryRun` flag
- Steps:
  1. Scan historical candidate + application events per company and role.
  2. Group by `(companyId, agencyId, roleId)` and compute counters.
  3. Upsert aggregated counters into `agencyAnalytics/{companyId}_{agencyId}_{roleId}`.
  4. Emit reconciliation report (source totals vs analytics totals).

### 5.5 Pros / Risks

Pros:

- Fast retrieval for dashboard endpoints.
- Predictable API latency at scale.
- Easier ranking generation with pre-aggregated counts.

Risks:

- More complex write path and consistency handling.
- Requires robust replay/backfill and monitoring for drift.
- Additional infra/storage maintenance.

---

### 5.6 Firestore Indexing / Query Optimization

For `agencyAnalytics` collection in Firestore:

- Document key strategy:
  - Primary key is deterministic doc id: `{companyId}_{agencyId}_{roleId}`.
  - Guarantees one document per unique combination and avoids duplicate aggregate rows.
- Recommended fields for filtering:
  - `companyId` (required filter in all endpoints)
  - `agencyId` (optional)
  - `roleId` (optional)
  - `updatedAt` (optional range/sort)
- Composite index recommendations:
  - `(companyId ASC, agencyId ASC, roleId ASC)`
  - `(companyId ASC, updatedAt DESC)`
  - `(companyId ASC, hiredCount DESC)` for top performers query optimization (optional).
- Write optimization:
  - Use atomic increments (`FieldValue.increment`) for counters.
  - Use transaction/batch for status transition updates where decrement+increment must be consistent.
  - Store and check `lastEventId` to keep writes idempotent during retries.

## 6) Recommended Rollout (Approach 1 Only)

### Phase 1 (MVP)

Implement Firestore aggregate document analytics in controlled rollout:

- Create `agencyAnalytics` collection and deterministic doc-id strategy.
- Wire first-event create + subsequent atomic counter updates from agency/candidate lifecycle methods.
- Add matrix + ranking endpoints over Firestore aggregate documents.
- Run limited tenant pilot for reconciliation checks.

### Phase 2 (Scale Optimization)

Scale Approach 1 with reliability safeguards:

- Run full historical backfill and validation report.
- Add drift monitoring and scheduled reconciliation.
- Add optional scheduled snapshot exports if long-range trend analytics is later required.

---

## 7) API Contract (Proposed)

- `GET /analytics/agency/performance-matrix`
  - Query: `companyId`, `agencyId?`, `roleId?`, `startDate?`, `endDate?`, `pageSize?`, `lastKey?`
- `GET /analytics/agency/ranking`
  - Query: `companyId`, `agencyId?`, `startDate?`, `endDate?`
- `GET /analytics/agency/performance-summary`
  - Query: `companyId`, `startDate?`, `endDate?`

All endpoints must apply existing authorization patterns.

---

## 8) Acceptance Criteria

- Document includes JSON prompt and explicit Do/Don't guardrails.
- Approach 1 is the only implementation approach in scope.
- Approach 1 includes Firestore schema, event touchpoints, index strategy, and backfill script plan.
- Ranking logic is clearly defined and implementable.
