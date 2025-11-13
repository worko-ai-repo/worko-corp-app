import { Router } from 'express';

// Load controllers
import CandidateProfileController from "../controllers/CandidateProfile.controller";

const candidateProfileController = new CandidateProfileController();

const CandidateProfileRouter = Router();

export default CandidateProfileRouter;