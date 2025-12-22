// Load the npm packages
import { Router } from "express";

// Import the routes
import AgencyUserInviteRouter from "./routers/AgencyUserInvite.router";
import AgencyJobAssignmentRouter from "./routers/AgencyJobAssignment.router";
import AgencyUserSubmissionRouter from "./routers/AgencyUserSubmission.router";
import AgencyUserRouter from "./routers/AgencyUser.router";
import AgencyBulkJdRouter from "./routers/AgencyBulkJd.router";
import AgencyBulkJdResumeRouter from "./routers/AgencyBulkJdResume.router";
import CorporateCandidateProfileRouter from "./routers/CorporateCandidateProfile.router";
import CentralCandidateProfileRouter from "./routers/CentralCandidateProfile.router";
import CandidateParsedCvRouter from "./routers/CandidateParsedCv.router";
import CandidateJobMatchingRouter from "./routers/CandidateJobMatching.router";
import FileRouter from "./routers/File.router";

// Router that contains all the routes/endpoints in the application
const router = Router();

/**
 * AUTHORISATION ROLES DESCRIPTION
 * 
 * Custom Roles
 *    "public" - Any user can access these routes even if they are not logged in
 *    "loggedInUser" - Only logged in users can access these routes
 *    "agency" - Whenever corporate-recruiter/admin invites an agency then if he signup then we store agency email in "worko-agency" user pool,
 *               so we are storing only agencies in that user pool, so we call "agency" role to these users
 * 
 * Cognito User Groups
 *    "admin" - Only worko admin users can access these routes
 *    "corporate-recruiter" - Only corporate recruiters can access these routes
 *    "corporate-admin" - Only corporate admin users can access these routes
 */

/**
 * Agency User Invite Routers
 */
router.use("/agency-invite", AgencyUserInviteRouter);

/**
 * Agency Job Assignment Routers
 */
router.use("/agency-job-assignment", AgencyJobAssignmentRouter);

/**
 * Agency User Submission Routers
 */
router.use("/agency-user-submission", AgencyUserSubmissionRouter);

/**
 * Agency User Routers
 */
router.use("/agency-user", AgencyUserRouter);

/**
 * AGENCY BULK JD ROUTERS
 * 
 * @authorisedRoles ["agency"]
 */
router.use("/agency-bulk-jd", AgencyBulkJdRouter);

/**
 * AGENCY BULK JD RESUME ROUTERS
 * 
 * @authorisedRoles ["agency"]
 */
router.use("/agency-bulk-jd-resume", AgencyBulkJdResumeRouter);

/**
 * Corporate Candidate Profile Routers
 */
router.use("/corporate-candidate-profile", CorporateCandidateProfileRouter);

/**
 * Central Candidate Profile Routers
 */
router.use("/central-candidate-profile", CentralCandidateProfileRouter);

/**
 * Candidate Parsed CV Routers
 */
router.use("/candidate-parsed-cv", CandidateParsedCvRouter);

/**
 * Candidate Job Matching Routers
 */
router.use("/candidate-job-matching", CandidateJobMatchingRouter);

/**
 * File Routers
 */
router.use("/file", FileRouter);

export default router;