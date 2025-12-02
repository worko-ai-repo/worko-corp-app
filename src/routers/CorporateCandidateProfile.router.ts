import { Router } from 'express';

// Load controllers
import CorporateCandidateProfileController from "../controllers/CorporateCandidateProfile.controller";

const corporateCandidateProfileController = new CorporateCandidateProfileController();

const CorporateCandidateProfileRouter = Router();

/**
 * Create Corporate Candidate Profile
 * @authorisedRoles ["agency"]
 */
CorporateCandidateProfileRouter.get("/duplicate", corporateCandidateProfileController.getDuplicateCorporateCandidateProfile);

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter"]
 */
CorporateCandidateProfileRouter.get("/", corporateCandidateProfileController.getAllCorporateCandidateProfileByFilterOptions);

export default CorporateCandidateProfileRouter;