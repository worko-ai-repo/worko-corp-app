import { Router } from 'express';

// Load controllers
import AgencyUserSubmissionController from "../controllers/AgencyUserSubmission.controller";

// Load middlewares
import { agencyUserSubmissionMiddleware } from '../middlewares/AgencyUserSubmission.middleware';

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

/**
 * @authorisedRoles ["admin","corporate-admin","corporate-recruiter"]
 */
AgencyUserSubmissionRouter.post(
  "/find-matching-score",
  agencyUserSubmissionMiddleware.validateAgencyUserSubmissionForFindMatchingScore,
  agencyUserSubmissionController.findMatchingScoreAgencyUserSubmission
);

/**
 * @authorisedRoles ["admin","corporate-admin","corporate-recruiter"]
 */
AgencyUserSubmissionRouter.post(
  "/find-matching-score/bulk",
  agencyUserSubmissionMiddleware.validateAgencyUserSubmissionForFindMatchingScore,
  agencyUserSubmissionController.bulkFindMatchingScoreAgencyUserSubmission
);

/**
 * @description
 *  1. We are using "post" http method because we are creating job application with "ACCEPTED" status and updating agency user submission at the same time
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
AgencyUserSubmissionRouter.post("/move-to-applicant", agencyUserSubmissionController.moveToApplicantAgencyUserSubmission);

/**
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
AgencyUserSubmissionRouter.post("/move-to-applicant/bulk", agencyUserSubmissionController.moveToApplicantBulkAgencyUserSubmission);

/**
 * @description 
 *  1. We are using "post" http method because we are creating job application with "UNDER_EVALUATION" status and updating agency user submission at the same time
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
AgencyUserSubmissionRouter.post("/send-for-evaluation", agencyUserSubmissionController.sendForEvaluationAgencyUserSubmission);

/**
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
AgencyUserSubmissionRouter.post("/send-for-evaluation/bulk", agencyUserSubmissionController.sendForEvaluationBulkAgencyUserSubmission);

/**
 * @description 
 *  1. Update the submitted candidate profile with rejected job application status
 *  2. We are using "patch" http method because we are just updating agency user submission and not creating job application
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
AgencyUserSubmissionRouter.patch("/reject-applicant", agencyUserSubmissionController.rejectApplicantAgencyUserSubmission);

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter", "admin"]
 */
AgencyUserSubmissionRouter.patch("/reject-applicant/bulk", agencyUserSubmissionController.rejectApplicantBulkAgencyUserSubmission);

/**
 * @authorisedRoles ["agency", "corporate-admin", "corporate-recruiter", "admin"]
 */
AgencyUserSubmissionRouter.get("/", agencyUserSubmissionController.getAllAgencyUserSubmissionByFilterOptions);

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter", "admin"]
 */
AgencyUserSubmissionRouter.get("/:id", agencyUserSubmissionController.getAgencyUserSubmissionById);

export default AgencyUserSubmissionRouter;