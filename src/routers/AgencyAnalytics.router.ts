// import express types
import { Router } from "express";

// Import controllers
import AgencyAnalyticsController from "../controllers/AgencyAnalytics.controller";

// Create the instance of AgencyAnalyticsController
const agencyAnalyticsController = new AgencyAnalyticsController();

// Create a new mountable router for the Agency Analytics APIs
const AgencyAnalyticsRouter = Router();

/**
 * getAgencyPerformanceMatrix
 *
 * @authorisedRoles ["admin", "corporate-admin"]
 */
AgencyAnalyticsRouter.get(
  "/agency-performance-matrix",
  agencyAnalyticsController.getAgencyPerformanceMatrix,
);

/**
 * getAgencyPerformanceSummary
 *
 * @authorisedRoles ["admin", "corporate-admin"]
 */
AgencyAnalyticsRouter.get(
  "/agency-performance-summary",
  agencyAnalyticsController.getAgencyPerformanceSummary,
);

// Export AgencyAnalyticsRouter
export default AgencyAnalyticsRouter;

