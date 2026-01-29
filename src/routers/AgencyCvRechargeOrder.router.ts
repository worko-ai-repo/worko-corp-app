import { Router } from "express";

import AgencyCvRechargeOrderController from "../controllers/AgencyCvRechargeOrder.controller";

const agencyCvRechargeOrderController = new AgencyCvRechargeOrderController();

const AgencyCvRechargeOrderRouter = Router();

/**
 * @authorisedRoles ["agency"]
 */
AgencyCvRechargeOrderRouter.post("/create", agencyCvRechargeOrderController.createAgencyCvRechargeOrder);

/**
 * @authorisedRoles ["agency"]
 */
AgencyCvRechargeOrderRouter.post("/verify-payment", agencyCvRechargeOrderController.verifyPaymentAgencyCvRechargeOrder);

export default AgencyCvRechargeOrderRouter;