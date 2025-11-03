import { BaseFirestoreModel } from "./Base.model";

interface AgencyUserSubmission extends BaseFirestoreModel {
  companyId: string;
  jobId: string;
  agencyUserId: string;
  agencyRegisteredEmail: string;
  agencyJobAssignmentId: string;
  agencyJobAssignedByCorporateUserId: string;
  candidateCvParsedId: string;
  candidateEmail: string;
}

export { AgencyUserSubmission };