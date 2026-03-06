import { Request, Response, NextFunction } from "express";

// Import models
import { DbAgencyCvWalletDto } from "../db/gcp-firestore-models/AgencyCvWallet.model";

// Import services
import { agencyCvWalletServiceObj } from "../services/AgencyCvWallet.service";

// import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";

class AgencyCvWalletController {
  getAgencyCvWalletById = async(req: Request, res: Response, next: NextFunction) => {
    try {
      const response: DbAgencyCvWalletDto | undefined =
        await agencyCvWalletServiceObj.performGetAgencyCvWalletByIdActivities(
          req.params.agencyUserId,
        );
      if(!response) {
        throw new BaseError("Agency cv wallet details not found.", HttpStatusCode.NOT_FOUND_404);
      }
      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(`Get Agency Cv Wallet By Id [Controller]`, {
        methodName: this.getAgencyCvWalletById.name,
        error,
      })
      next(error);
    }
  }
}

export default AgencyCvWalletController;