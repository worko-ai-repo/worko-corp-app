import { Router } from 'express';

// Load controllers
import CandidateParsedCvController from "../controllers/CandidateParsedCv.controller";

// Import middlewares
import { candidateParsedCvMiddlewareObj } from '../middlewares/CandidateParsedCv.middleware';

const candidateParsedCvController = new CandidateParsedCvController();

const CandidateParsedCvRouter = Router();

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter"]
 */
CandidateParsedCvRouter.get("/search-in-db/corp-action", candidateParsedCvController.getAllCandidateParsedCvByCorpEmbeddingFilterOptions);

/**
 * @authorisedRoles ["worko-admin"]
 */
CandidateParsedCvRouter.get("/search-in-db/admin-action", candidateParsedCvController.getAllCandidateParsedCvByAdminEmbeddingFilterOptions);

/**
 * @authorisedRoles ["evaluator"]
 */
CandidateParsedCvRouter.get("/:id", candidateParsedCvController.getCandidateParsedCvById);

/**
 * @description
 *  1. We are using "post" http method because we are creating job application with "ACCEPTED" status
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
CandidateParsedCvRouter.post("/move-to-applicant", candidateParsedCvController.moveToApplicantCandidateParsedCv);

/**
 * @authorisedRoles ["admin","corporate-admin","corporate-recruiter"]
 */
CandidateParsedCvRouter.post(
  "/find-matching-score",
  candidateParsedCvMiddlewareObj.validateCandidateParsedCvForFindMatchingScore,
  candidateParsedCvController.findMatchingScoreCandidateParsedCv
);

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter", "admin"]
 */
CandidateParsedCvRouter.patch("/:id", candidateParsedCvController.updateCandidateParsedCvById);

export default CandidateParsedCvRouter;