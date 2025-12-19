// Import express packages
import { Request, Response, NextFunction } from "express";

// Import models
import { DbCandidateJobMatchingDto } from "../db/gcp-firestore-models/CandidateJobMatching.model";

// Import services
import { candidateJobMatchingServiceObj } from "../services/CandidateJobMatching.service";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";

class CandidateJobMatchingController {
  getCandidateJobMatchingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response: DbCandidateJobMatchingDto | undefined = await candidateJobMatchingServiceObj.getCandidateJobMatchingById(req.params.id);
      if(!response) {
        throw new BaseError("Candidate job matching details not found", HttpStatusCode.NOT_FOUND_404);
      }
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get Candidate Job Matching By Id [Controller]`, {
        methodName: this.getCandidateJobMatchingById.name,
        error,
      });

      next(error);
    }
  }
}

export default CandidateJobMatchingController;