import { Router } from 'express';

// Load controllers
import BulkSourceTypeResumeController from "../controllers/BulkSourceTypeResume.controller";

const bulkSourceTypeResumeController = new BulkSourceTypeResumeController();

const BulkSourceTypeResumeRouter = Router();

/**
 * @authorisedRoles ["admin", "corporate-admin", "corporate-recruiter"]
 */
BulkSourceTypeResumeRouter.post(
  "/",
  bulkSourceTypeResumeController.createBulkSourceTypeResume,
);

BulkSourceTypeResumeRouter.get(
  "/:id",
  bulkSourceTypeResumeController.getBulkSourceTypeResumeById,
);

export default BulkSourceTypeResumeRouter;