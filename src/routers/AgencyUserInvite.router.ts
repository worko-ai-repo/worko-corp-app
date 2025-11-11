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
 * Get Agency User Invite by id
 * @authorisedRoles ["public"]
 */
AgencyUserInviteRouter.get("/:id",agencyUserInviteController.getAgencyUserInviteById);

/**
 * Agency User Invite Update by corp user
 * @authorisedRoles ["corporate-admin","corporate-recruiter"]
 */
AgencyUserInviteRouter.patch("/corp-action",agencyUserInviteController.updateAgencyUserInviteByCorpUser);

/**
 * Agency User Invite Update by agency user
 * @authorisedRoles ["agency"]
 */
AgencyUserInviteRouter.patch("/agency-action",agencyUserInviteController.updateAgencyUserInviteByAgencyUser);

export default AgencyUserInviteRouter;