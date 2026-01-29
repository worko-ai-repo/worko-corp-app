import { Request, Response, NextFunction } from "express";

// Import dtos
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import { AgencyCvCreditTransactionListingFilterOptions, AgencyCvCreditTransactionListingFilterRequestDTO } from "../dtos/AgencyCvCreditTransaction.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import models
import { DbAgencyCvCreditTransactionDto } from "../db/gcp-firestore-models/AgencyCvCreditTransaction.model";

// Import schemas
import { agencyCvCreditTransactionFilterDtoValidation } from "../schemas/AgencyCvCreditTransaction.schema";

// Import services
import {agencyCvCreditTransactionServiceObj} from "../services/AgencyCvCreditTransaction.service";

import HttpStatusCode from "../utils/http-codes.util";
import { RequestValidationError } from "../utils/errors.util";

class AgencyCvCreditTransactionController {
  async getAllAgencyCvCreditTransactionByFilterOptions(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const filterRequest: AgencyCvCreditTransactionListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyCvCreditTransactionListingFilterRequestDTO,
          AgencyCvCreditTransactionListingFilterOptions
        >(
          req.query as unknown as AgencyCvCreditTransactionListingFilterRequestDTO,
        );

      let { error, value: validatedRequestBody } =
        agencyCvCreditTransactionFilterDtoValidation.validate(filterRequest, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: GcpFirestoreRecordListingResponseDTO<
        DbAgencyCvCreditTransactionDto[]
      > =
        await agencyCvCreditTransactionServiceObj.performGetAllAgencyCvCreditTransactionByFilterOptions(
          validatedRequestBody,
        );

      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Get All Agency Cv Credit Transaction By Filter Options [Controller]`,
        {
          methodName: this.getAllAgencyCvCreditTransactionByFilterOptions.name,
          error,
        },
      );

      next(error);
    }
  }
}

export default AgencyCvCreditTransactionController;