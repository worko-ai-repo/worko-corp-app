import { Router } from 'express';

// Load controllers
import AgencyJobAssignmentController from "../controllers/AgencyJobAssignment.controller";

const agencyJobAssignmentController = new AgencyJobAssignmentController();

const AgencyJobAssignmentRouter = Router();

/**
 * Create Agency Job Assignment
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
AgencyJobAssignmentRouter.post("/", agencyJobAssignmentController.createAgencyJobAssignment);

export default AgencyJobAssignmentRouter;