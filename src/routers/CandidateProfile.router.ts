import { Router } from 'express';

// Load controllers
import CandidateProfileController from "../controllers/CandidateProfile.controller";

const candidateProfileController = new CandidateProfileController();

const CandidateProfileRouter = Router();

/**
 * Create Candidate Profile
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
CandidateProfileRouter.post("/", candidateProfileController.createCandidateProfile);

export default CandidateProfileRouter;