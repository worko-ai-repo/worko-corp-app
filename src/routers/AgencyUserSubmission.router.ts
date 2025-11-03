import { Router } from 'express';

// Load controllers
import AgencyUserSubmissionController from "../controllers/AgencyUserSubmission.controller";

const agencyUserSubmissionController = new AgencyUserSubmissionController();

const AgencyUserSubmissionRouter = Router();

/**
 * Create Agency User Submission
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
AgencyUserSubmissionRouter.post("/", agencyUserSubmissionController.createAgencyUserSubmission);

export default AgencyUserSubmissionRouter;