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
 * @authorisedRoles ["public"]
 */
CandidateParsedCvRouter.post("/parse/submit-form", candidateParsedCvController.parseSubmitFormCandidateParsedCv);

/**
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
CandidateParsedCvRouter.post("/move-to-applicant", candidateParsedCvController.moveToApplicantCandidateParsedCv);

/**
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
CandidateParsedCvRouter.post("/duplicate-job-appl/bulk", candidateParsedCvController.duplicateJobApplicantBulkCandidateParsedCv);

/**
 * @authorisedRoles ["corporate-recruiter", "corporate-admin", "admin"]
 */
CandidateParsedCvRouter.post("/move-to-applicant/bulk", candidateParsedCvController.moveToApplicantBulkCandidateParsedCv);

/**
 * @authorisedRoles ["admin","corporate-admin","corporate-recruiter"]
 */
CandidateParsedCvRouter.post(
  "/find-matching-score",
  candidateParsedCvMiddlewareObj.validateCandidateParsedCvForFindMatchingScore,
  candidateParsedCvController.findMatchingScoreCandidateParsedCv
);

/**
 * @authorisedRoles ["admin","corporate-admin","corporate-recruiter"]
 */
CandidateParsedCvRouter.post(
  "/find-matching-score/bulk",
  candidateParsedCvMiddlewareObj.validateCandidateParsedCvForFindMatchingScore,
  candidateParsedCvController.findMatchingScoreBulkCandidateParsedCv
);

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter", "admin"]
 */
CandidateParsedCvRouter.post("/refresh", candidateParsedCvController.refreshCandidateParsedCv);

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter", "admin"]
 */
CandidateParsedCvRouter.post("/reset-temporary-credentials", candidateParsedCvController.resetTempPasswordCandidateParsedCv);

/**
 * @authorisedRoles ["corporate-admin", "corporate-recruiter", "admin"]
 */
CandidateParsedCvRouter.patch("/:id", candidateParsedCvController.updateCandidateParsedCvById);

export default CandidateParsedCvRouter;