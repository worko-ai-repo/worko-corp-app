// Import express packages
import { Request, Response, NextFunction } from "express";

// Import utils
import HttpStatusCode from "../utils/http-codes.util";
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

/**
 * TestController
 *
 * This class is used to create, read, update, delete and search Tests.
 */
class TestController {
  getAllTestsByFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      global.logger.info(`Test [Controller]`, {
        filePath: __filename,
        methodName: this.getAllTestsByFilterOptions.name,
      });

      // send response with Test details
      res.status(HttpStatusCode.OK_200).json({});
    } catch (error) {
      global.logger.error(`Test [Controller]`, {
        filePath: __filename,
        methodName: this.getAllTestsByFilterOptions.name,
        error,
      });
      // Pass the error to Express's default error handler
      next(error);
    }
  };

  createDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const testData = { name: "Test Document", createdAt: new Date(), ...req.body };
      const docRef = await gcpFirestoreLibrary.createDocument(
        {
          databaseName: "worko-corp-db-dev",
          collectionName: "tests",
        },
        testData
      );
      
      res.status(HttpStatusCode.OK_200).json(docRef);
    } catch (error) {
      global.logger.error(`Test [Controller]`, {
        filePath: __filename,
        methodName: this.createDocument.name,
        error,
      });
      next(error);
    }
  };

  getDocumentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const doc = await gcpFirestoreLibrary.getDocumentById(
        {
          databaseName: "worko-corp-db-dev",
          collectionName: "tests",
        },
        id
      );

      if (!doc) {
        return res.status(HttpStatusCode.NOT_FOUND_404).json({ message: "Test not found" });
      }
      
      res.status(HttpStatusCode.OK_200).json(doc);
    } catch (error) {
      global.logger.error(`Test [Controller]`, {
        filePath: __filename,
        methodName: this.getDocumentById.name,
        error,
      });
      next(error);
    }
  };
}

export default TestController;