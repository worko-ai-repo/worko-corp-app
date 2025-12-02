import { Router } from 'express';

// Load controllers
import CentralCandidateProfileController from "../controllers/CentralCandidateProfile.controller";

const centralCandidateProfileController = new CentralCandidateProfileController();

const CentralCandidateProfileRouter = Router();

/**
 * @authorisedRoles ["admin"]
 */
CentralCandidateProfileRouter.get("/", centralCandidateProfileController.getAllCentralCandidateProfileByFilterOptions);

export default CentralCandidateProfileRouter;