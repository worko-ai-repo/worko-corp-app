
import { Request, Response, NextFunction } from "express";

import { userJobApplicationDao } from "../daos/UserJobApplication.dao";

// Import services
import { scriptServiceObj } from "../services/Script.service";

// Import local utils
import HttpStatusCode from "../utils/http-codes.util";
import { candidateParsedCvServiceObj } from "../services/CandidateParsedCv.service";

class ScriptController {
  scriptTest = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
   try {
      // const data = await userJobApplicationDao.getJobApplicationByJobIdAndApplicantEmails(
      //    "01K99Y76EVQ0K5ZA8HYHZEA70N",
      //    [
      //       "ranganayaki.r+72345@worko.ai",
      //       "rohithappala777+signupflowtest3@gmail.com"
      //    ],
      //    {
      //       pageSize: 10
      //    }
      // );

      // const data = await candidateParsedCvServiceObj.resendTempPasswordCandidateParsedCv(
      //    req.body.candidateEmail
      // );
      res.status(HttpStatusCode.FORBIDDEN_403).json({
         message: "Forbidden",
      });
   } catch (error) {
      global.logger.error(`Script Test [Controller]`, {
         methodName: this.scriptTest.name,
         error,
      })
      next(error);
   }
  };

  scriptToConvertCentralCandidateProfileEmailToLowerCaseAsync = async (req: Request, res: Response, next: NextFunction) => {
   try {
      // const data = await scriptServiceObj.scriptToConvertCentralCandidateProfileEmailToLowerCaseAsync()
      res.status(HttpStatusCode.FORBIDDEN_403).json({
         message: "Not Allowed",
      });
      // res.status(HttpStatusCode.ACCEPTED_202).json({
      //   message: `Conversion to lower case initaited successfully, check "worko-corp-${process.env.APP_STAGE}-appInvokeLambda" aws lambda cloudwatch logs for the success/failure tracking.`,
      //   apiGatewayResponse: data
      // });
   } catch (error) {
      global.logger.error(`Script Test [Controller]`, {
         methodName: this.scriptTest.name,
         error,
      })
      next(error);
   }
  }

  scriptToAppendDotPdfInCvAwsS3FileCandidateParsedCvAsync = async (req: Request, res: Response, next: NextFunction) => {
   try {
      // const data = await scriptServiceObj.scriptToAppendDotPdfInCvAwsS3FileCandidateParsedCvAsync()
      res.status(HttpStatusCode.FORBIDDEN_403).json({
         message: "Not Allowed",
      });
      // res.status(HttpStatusCode.ACCEPTED_202).json({
      //   message: `Append .pdf in CvAwsS3FileName in candidateParsedCvs collection initaited successfully, check "worko-corp-${process.env.APP_STAGE}-appInvokeLambda" aws lambda cloudwatch logs for the success/failure tracking.`,
      //   apiGatewayResponse: data
      // });
   } catch (error) {
      global.logger.error(`Script Test [Controller]`, {
         methodName: this.scriptTest.name,
         error,
      })
      next(error);
   }
  }

  scriptToAddCandNameInCorporateCandidateProfileAsync = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const data = await scriptServiceObj.scriptToAddCandNameInCorporateCandidateProfileAsync()
      // res.status(HttpStatusCode.FORBIDDEN_403).json({
      //    message: "Not Allowed",
      // });
      res.status(HttpStatusCode.ACCEPTED_202).json({
        message: `Add candidate and company name in agencyUserSubmissions collection initaited successfully, check "worko-corp-${process.env.APP_STAGE}-appInvokeLambda" aws lambda cloudwatch logs for the success/failure tracking.`,
        apiGatewayResponse: data
      });
   } catch (error) {
      global.logger.error(`Script Test [Controller]`, {
         methodName: this.scriptTest.name,
         error,
      })
      next(error);
   }
  }

  scriptToAddCandNameInCentralCandidateProfileAsync = async (req: Request, res: Response, next: NextFunction) => {
     try {
        const data = await scriptServiceObj.scriptToAddCandNameInCentralCandidateProfileAsync()
        // res.status(HttpStatusCode.FORBIDDEN_403).json({
        //   message: "Not Allowed",
        // });
        res.status(HttpStatusCode.ACCEPTED_202).json({
           message: `Add candidate name in centralCandidateProfiles collection initaited successfully, check "worko-corp-${process.env.APP_STAGE}-appInvokeLambda" aws lambda cloudwatch logs for the success/failure tracking.`,
           apiGatewayResponse: data
        });
     } catch (error) {
        global.logger.error(`Script Test [Controller]`, {
           methodName: this.scriptTest.name,
           error,
        })
        next(error);
     }
  }
}

export default ScriptController;
