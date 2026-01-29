import { Router } from "express";
import AgencyCvCreditTransactionController from "../controllers/AgencyCvCreditTransaction.controller";

const agencyCvCreditTransactionController = new AgencyCvCreditTransactionController();

const AgencyCvCreditTransactionRouter = Router();

AgencyCvCreditTransactionRouter.get("/", agencyCvCreditTransactionController.getAllAgencyCvCreditTransactionByFilterOptions);

export default AgencyCvCreditTransactionRouter;