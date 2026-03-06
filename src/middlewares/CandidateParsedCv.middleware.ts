// Load the npm packages
import { Request, Response, NextFunction } from "express";

// Import constants
import APP_CONSTANTS from "../configs/constants.config";

// Import helpers
import { getActionByUserId } from "../helpers/user.helper";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { BaseError } from "../utils/errors.util";

class CandidateParsedCvMiddleware {
  validateCandidateParsedCvForFindMatchingScore = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { actionByUserId, actionByCorporateUserId } = getActionByUserId();
      const cognitoUserGroups: string[] =
        global.requestLocalContext.cognitoUserGroups;

      if (!actionByCorporateUserId) {
        // Check if the user is a worko admin
        if (
          !actionByUserId ||
          !cognitoUserGroups.includes(
            APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN
          )
        ) {
          global.logger.error(`User is not a worko admin.`, {
            actionByUserId,
            cognitoUserGroups,
            actionByCorporateUserId,
            methodName:
              this.validateCandidateParsedCvForFindMatchingScore.name,
          });
          throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
        }
      }

      next();
    } catch (error) {
      global.logger.error(
        `Error in the validateCandidateParsedCvForFindMatchingScore middleware.`,
        {
          methodName:
            this.validateCandidateParsedCvForFindMatchingScore.name,
          error,
        }
      );
      next(error);
    }
  };
}

const candidateParsedCvMiddlewareObj: CandidateParsedCvMiddleware =
  new CandidateParsedCvMiddleware();

export { candidateParsedCvMiddlewareObj, CandidateParsedCvMiddleware };
