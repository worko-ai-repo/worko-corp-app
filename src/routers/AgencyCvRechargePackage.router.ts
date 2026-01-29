import { Router } from "express";

// Load controllers
import AgencyCvRechargePackageController from "../controllers/AgencyCvRechargePackage.controller";

const agencyCvRechargePackageController =
  new AgencyCvRechargePackageController();

const AgencyCvRechargePackageRouter = Router();

/**
 * @authorisedRoles ["admin"]
 */
AgencyCvRechargePackageRouter.post(
  "/",
  agencyCvRechargePackageController.createAgencyCvRechargePackage,
);

/**
 * @authorisedRoles ["agency"]
 */
AgencyCvRechargePackageRouter.get(
  "/",
  agencyCvRechargePackageController.getAgencyCvRechargePackageByFilterOptions,
);

export default AgencyCvRechargePackageRouter;
