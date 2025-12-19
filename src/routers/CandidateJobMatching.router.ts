import { Router } from 'express';

// Load controllers
import CandidateJobMatchingController from "../controllers/CandidateJobMatching.controller";

const candidateJobMatchingController = new CandidateJobMatchingController();

const CandidateJobMatchingRouter = Router();

/**
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
CandidateJobMatchingRouter.get("/:id", candidateJobMatchingController.getCandidateJobMatchingById);

export default CandidateJobMatchingRouter;