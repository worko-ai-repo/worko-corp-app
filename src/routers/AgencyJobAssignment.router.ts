import { Router } from 'express';

// Load controllers
import AgencyJobAssignmentController from "../controllers/AgencyJobAssignment.controller";

const agencyJobAssignmentController = new AgencyJobAssignmentController();

const AgencyJobAssignmentRouter = Router();

/**
 * Create Agency Job Assignment
 * 
 * @note As of now only `corporate-recruiter/admin` or `worko-admin` 
 *   will upload different jobs for same `company` to single `agency registered user`, 
 *   If requirement change in near future then we need to update the logic in this api flow
 * 
 * @authorisedRoles ["corporate-admin","corporate-recruiter", "admin"]
 */
AgencyJobAssignmentRouter.post("/bulk", agencyJobAssignmentController.createBulkAgencyJobAssignment);

/**
 * Get Agency Job Assignment by id
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
AgencyJobAssignmentRouter.patch("/bulk/remove-jobs", agencyJobAssignmentController.removeBulkAgencyJobAssignment);

/**
 * Get All Agency Job Assignment
 * @authorisedRoles ["agency", "corporate-admin","corporate-recruiter"]
 */
AgencyJobAssignmentRouter.get("/", agencyJobAssignmentController.getAllAgencyJobAssignmentByFilterOptions);

export default AgencyJobAssignmentRouter;