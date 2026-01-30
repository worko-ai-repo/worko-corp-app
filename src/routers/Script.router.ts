// Load the npm packages
import { Router } from "express";

// Import Controllers
import ScriptController from "../controllers/Script.controller";

// Create Router
const ScriptRouter = Router();

// Initialize the ScriptController
const scriptController = new ScriptController();

ScriptRouter.post("/test", scriptController.scriptTest);

export default ScriptRouter;