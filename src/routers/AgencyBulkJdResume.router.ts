// import express types
import { Router } from "express";

// Import controllers
import AgencyBulkJdResumeController from "../controllers/AgencyBulkJdResume.controller";

// Create the instance of AgencyBulkJdResumeController
const agencyBulkJdResumeController = new AgencyBulkJdResumeController();

// Create a new mountable router for the Agency Bulk JD Resume APIs
const AgencyBulkJdResumeRouter = Router();

/**
 * getAllAgencyBulkJdResumesByFilterOptions
 *
 * This endpoint is used to get all Agency Bulk JD Resumes by filter options
 *
 * @authorisedRoles [agency"]
 */
AgencyBulkJdResumeRouter.get(
  "/",
  agencyBulkJdResumeController.getAllAgencyBulkJdResumesByFilterOptions
);

AgencyBulkJdResumeRouter.get('/:id', agencyBulkJdResumeController.getAgencyBulkJdResumeById);

// Export AgencyBulkJdResumeRouter
export default AgencyBulkJdResumeRouter;
