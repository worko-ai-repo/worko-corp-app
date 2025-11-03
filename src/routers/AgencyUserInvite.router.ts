import { Router } from 'express';

// Load controllers
import AgencyUserInviteController from "../controllers/AgencyUserInvite.controller";

const agencyUserInviteController = new AgencyUserInviteController();

const AgencyUserInviteRouter = Router();

/**
 * Create Agency User Invite
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
AgencyUserInviteRouter.post("/",agencyUserInviteController.createAgencyUserInvite);

/**
 * Get All Agency User Invites
 * @authorisedRoles ["corporate-admin","corporate-recruiter", "admin", "agency"]
 */
AgencyUserInviteRouter.get("/",agencyUserInviteController.getAllAgencyUserInvitesByFilterOptions);

/**
 * Send Agency User Invite
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
AgencyUserInviteRouter.patch("/",agencyUserInviteController.updateAgencyUserInvite);

export default AgencyUserInviteRouter;