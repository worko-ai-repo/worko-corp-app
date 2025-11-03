import { Router } from 'express';

// Load controllers
import CandidateCvParsedController from "../controllers/CandidateCvParsed.controller";

const candidateCvParsedController = new CandidateCvParsedController();

const CandidateCvParsedRouter = Router();

/**
 * Create Candidate CV Parsed
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
CandidateCvParsedRouter.post("/", candidateCvParsedController.createCandidateCvParsed);

export default CandidateCvParsedRouter;