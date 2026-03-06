// import express types
import { Router } from "express";

// Import controllers
import AgencyBulkJdController from "../controllers/AgencyBulkJd.controller";
import AgencyBulkJdResumeController from "../controllers/AgencyBulkJdResume.controller";

// Create the instance of AgencyBulkJdController and AgencyBulkJdResumeController
const agencyBulkJdController = new AgencyBulkJdController();
const agencyBulkJdResumeController = new AgencyBulkJdResumeController();

// Create a new mountable router for the Agency Bulk JD APIs
const AgencyBulkJdRouter = Router();

/**
 * createAgencyBulkJd
 *
 * This endpoint is used to create a new Agency Bulk Job Description
 *
 * @authorisedRoles ["agency"]
 */
AgencyBulkJdRouter.post("/", agencyBulkJdController.createAgencyBulkJd);

/**
 * createAgencyBulkJdResumes
 *
 * This endpoint is used to create new Agency Bulk Job Description Resumes
 * and generate pre-signed urls for bulk cvs
 *
 * @authorisedRoles ["agency"]
 */
AgencyBulkJdRouter.post(
  "/:id/resumes",
  agencyBulkJdResumeController.createAgencyBulkJdResumes
);

/**
 * getAllAgencyBulkJdByFilterOptions
 *
 * This endpoint is used to get all Agency Bulk Job Description by filter options
 *
 * @authorisedRoles ["agency"]
 */
AgencyBulkJdRouter.get(
  "/",
  agencyBulkJdController.getAllAgencyBulkJdByFilterOptions
);

/**
 * getAgencyBulkJdById
 *
 * Get Agency Bulk Job Description by id
 *
 * @authorisedRoles ["agency"]
 */
AgencyBulkJdRouter.get("/:id", agencyBulkJdController.getAgencyBulkJdById);

// Export AgencyBulkJdRouter
export default AgencyBulkJdRouter;
