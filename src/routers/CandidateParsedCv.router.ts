import { Router } from 'express';

// Load controllers
import CandidateParsedCvController from "../controllers/CandidateParsedCv.controller";

const candidateParsedCvController = new CandidateParsedCvController();

const CandidateParsedCvRouter = Router();

/**
 * @authorisedRoles ["evaluator"]
 */
CandidateParsedCvRouter.get("/:id", candidateParsedCvController.getCandidateParsedCvById);

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter"]
 */
CandidateParsedCvRouter.get("/corp-action", candidateParsedCvController.getAllCandidateParsedCvByCorporateFilterOptions);

export default CandidateParsedCvRouter;