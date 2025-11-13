import { Router } from 'express';

// Load controllers
import AgencyUserSubmissionController from "../controllers/AgencyUserSubmission.controller";

const agencyUserSubmissionController = new AgencyUserSubmissionController();

const AgencyUserSubmissionRouter = Router();

/**
 * Parse Candidate CV by Agency
 * @authorisedRoles ["agency"]
 */
AgencyUserSubmissionRouter.post("/candidate-parse-cv", agencyUserSubmissionController.parseAgencyUserSubmissionCandidateCv);

/**
 * Create Agency User Submission
 * @authorisedRoles ["agency"]
 */
AgencyUserSubmissionRouter.post("/", agencyUserSubmissionController.createAgencyUserSubmission);

export default AgencyUserSubmissionRouter;