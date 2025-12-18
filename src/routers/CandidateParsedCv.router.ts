import { Router } from 'express';

// Load controllers
import CandidateParsedCvController from "../controllers/CandidateParsedCv.controller";

const candidateParsedCvController = new CandidateParsedCvController();

const CandidateParsedCvRouter = Router();

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter"]
 */
CandidateParsedCvRouter.get("/seach-in-db/corp-action", candidateParsedCvController.getAllCandidateParsedCvByCorpEmbeddingFilterOptions);

/**
 * @authorisedRoles ["evaluator"]
 */
CandidateParsedCvRouter.get("/:id", candidateParsedCvController.getCandidateParsedCvById);

export default CandidateParsedCvRouter;