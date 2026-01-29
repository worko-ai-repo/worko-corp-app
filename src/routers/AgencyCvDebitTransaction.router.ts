import { Router } from "express";

// Load controllers
import AgencyCvDebitTransactionController from "../controllers/AgencyCvDebitTransaction.controller";

const agencyCvDebitTransactionController = new AgencyCvDebitTransactionController();

const AgencyCvDebitTransactionRouter = Router();

/**
 * @authorisedRoles ["agency"]
 */
AgencyCvDebitTransactionRouter.get("/", agencyCvDebitTransactionController.getAllAgencyCvDebitTransactionByFilterOptions);

export default AgencyCvDebitTransactionRouter;