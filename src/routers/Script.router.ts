// Load the npm packages
import { Router } from "express";

// Import Controllers
import ScriptController from "../controllers/Script.controller";

// Create Router
const ScriptRouter = Router();

// Initialize the ScriptController
const scriptController = new ScriptController();

ScriptRouter.post("/test", scriptController.scriptTest);

ScriptRouter.post("/email-to-lowercase-central-cand-profile", scriptController.scriptToConvertCentralCandidateProfileEmailToLowerCaseAsync);

ScriptRouter.post("/append-dot-pdf-cv-candidate-parsed-cv", scriptController.scriptToAppendDotPdfInCvAwsS3FileCandidateParsedCvAsync);

export default ScriptRouter;