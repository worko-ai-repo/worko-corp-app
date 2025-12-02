import { Router } from 'express';

// Load controllers
import AgencyUserController from "../controllers/AgencyUser.controller";

const agencyUserController = new AgencyUserController();

const AgencyUserRouter = Router();

/**
 * @note "agency" - Whenever corporate-recruiter/admin invites an agency then if he signup then we store agency email in "worko-agency" user pool,
 *               so we are storing only agencies in that user pool, so we call "agency" role to these users,
 *               "agency" is not a cognito user group.
 */

/**
 * Create Agency User
 * @authorisedRoles ["agency"]
 */
AgencyUserRouter.post("/", agencyUserController.createAgencyUser);

/**
 * Get Agency User by id
 * @authorisedRoles ["agency"]
 */
AgencyUserRouter.get("/:id", agencyUserController.getAgencyUserById);

/**
 * Get Agency User by cognito user id
 * @authorisedRoles ["agency"]
 */
AgencyUserRouter.get("/:id/cognito", agencyUserController.getAgencyUserByCognitoUserId);

export default AgencyUserRouter;