import { Router } from 'express';

// Load controllers
import CandidateParsedCvController from "../controllers/CandidateParsedCv.controller";

const candidateParsedCvController = new CandidateParsedCvController();

const CandidateParsedCvRouter = Router();

export default CandidateParsedCvRouter;