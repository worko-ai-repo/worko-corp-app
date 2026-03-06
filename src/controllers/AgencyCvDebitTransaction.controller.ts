import { NextFunction, Request, Response } from "express";

// Import dtos
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";
import {
  AgencyCvDebitTransactionListingFilterOptions,
  AgencyCvDebitTransactionListingFilterRequestDTO,
} from "../dtos/AgencyCvDebitTransaction.dto";

// Import helpers
import { GcpFirestoreRequestHelper } from "../helpers/request.gcp-firestore.helper";

// Import models
import { DbAgencyCvDebitTransactionDto } from "../db/gcp-firestore-models/AgencyCvDebitTransaction.model";

// Import services
import { agencyCvDebitTransactionServiceObj } from "../services/AgencyCvDebitTransaction.service";

// Import schemas
import { agencyCvDebitTransactionFilterDtoValidation } from "../schemas/AgencyCvDebitTransaction.schema";

// Import utils
import { RequestValidationError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyCvDebitTransactionController {
  async getAllAgencyCvDebitTransactionByFilterOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const filterRequest: AgencyCvDebitTransactionListingFilterOptions =
        GcpFirestoreRequestHelper.parseFilterOptions<
          AgencyCvDebitTransactionListingFilterRequestDTO,
          AgencyCvDebitTransactionListingFilterOptions
        >(
          req.query as unknown as AgencyCvDebitTransactionListingFilterRequestDTO,
        );

      let { error, value: validatedRequestBody } =
        agencyCvDebitTransactionFilterDtoValidation.validate(filterRequest, {
          abortEarly: false,
        });
      if (error) {
        throw new RequestValidationError(error);
      }

      const response: GcpFirestoreRecordListingResponseDTO<
        DbAgencyCvDebitTransactionDto[]
      > =
        await agencyCvDebitTransactionServiceObj.getAllAgencyCvDebitTransactionByFilterOptions(
          validatedRequestBody,
        );

      res.status(HttpStatusCode.OK_200).json(response);
    } catch (error) {
      global.logger.error(
        `Get All Agency Cv Debit Transaction By Filter Options [Controller]`,
        {
          methodName: this.getAllAgencyCvDebitTransactionByFilterOptions.name,
          error,
        },
      );

      next(error);
    }
  }
}

export default AgencyCvDebitTransactionController;