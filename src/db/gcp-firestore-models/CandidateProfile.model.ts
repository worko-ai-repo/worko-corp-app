import { BaseFirestoreModel } from "./Base.model";

interface CandidateProfile extends BaseFirestoreModel {
  candidateEmail: string;
  companyId: string;
  jobId?: string;
  refereeType: string;
  candidateCvParsedId: string;
  agencyUserSubmissionId?: string;
}

export { CandidateProfile };