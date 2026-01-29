import { Router } from "express";
import AgencyCvWalletController from "../controllers/AgencyCvWallet.controller";

const agencyCvWalletController = new AgencyCvWalletController();

const AgencyCvWalletRouter = Router();

/**
 * @authorisedRoles ["agency"]
 * @description "agencyUserId" is the "id" field of "AgencyUser.model.ts" 
 */
AgencyCvWalletRouter.get(
  "/:agencyUserId",
  agencyCvWalletController.getAgencyCvWalletById,
);

export default AgencyCvWalletRouter;