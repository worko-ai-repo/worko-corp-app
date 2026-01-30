
import { Request, Response, NextFunction } from "express";

import { userJobApplicationDao } from "../daos/UserJobApplication.dao";

// Import local utils
import HttpStatusCode from "../utils/http-codes.util";

class ScriptController {
  scriptTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
   try {
      const data = await userJobApplicationDao.getJobApplicationByJobIdAndApplicantEmails(
         "01K99Y76EVQ0K5ZA8HYHZEA70N",
         [
            "ranganayaki.r+72345@worko.ai",
            "rohithappala777+signupflowtest3@gmail.com"
         ],
         {
            pageSize: 10
         }
      );
      res.status(HttpStatusCode.OK_200).json(data);
   } catch (error) {
      global.logger.error(`Script Test [Controller]`, {
         methodName: this.scriptTest.name,
         error,
      })
      next(error);
   }
  };
}

export default ScriptController;
