import { BaseFirestoreModel } from "./Base.model";

interface AgencyJobAssignment extends BaseFirestoreModel {
  companyId: string;
  jobId: string;
  assignedByCorporateUserId: string;
  agencyUserId: string;
  agencyRegisteredEmail: string;
  status: string;
}

export { AgencyJobAssignment };