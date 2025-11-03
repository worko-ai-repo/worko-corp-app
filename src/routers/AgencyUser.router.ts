import { Router } from 'express';

// Load controllers
import AgencyUserController from "../controllers/AgencyUser.controller";

const agencyUserController = new AgencyUserController();

const AgencyUserRouter = Router();

/**
 * Create Agency User
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
AgencyUserRouter.post("/", agencyUserController.createAgencyUser);

export default AgencyUserRouter;