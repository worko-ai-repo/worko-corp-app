
// Import daos
import { agencyCvDebitTransactionDao } from "../daos/AgencyCvDebitTransaction.dao";

// Import dtos
import { AgencyCvDebitTransactionCreateDto, AgencyCvDebitTransactionListingFilterOptions } from "../dtos/AgencyCvDebitTransaction.dto";

// Import helpers
import { getActionByAgencyUserIds } from "../helpers/user.helper";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";
import { DbAgencyCvDebitTransactionDto } from "../db/gcp-firestore-models/AgencyCvDebitTransaction.model";

// Import services
import { agencyUserServiceObj } from "./AgencyUser.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyCvDebitTransactionService {
  async createAgencyCvDebitTransaction(createDto: AgencyCvDebitTransactionCreateDto): Promise<DbAgencyCvDebitTransactionDto | undefined> {
    return agencyCvDebitTransactionDao.createAgencyCvDebitTransaction(createDto);
  }

  async performGetAllAgencyCvDebitTransactionByFilterOptions(filterOptions: AgencyCvDebitTransactionListingFilterOptions) {
    const { convertedAgencyCognitoUserId } = getActionByAgencyUserIds();

    if(filterOptions.agencyUserId !== convertedAgencyCognitoUserId) {
      global.logger.error(`Given agencyUserId is not matching with convertedAgencyCognitoUserId.`, { filterOptions });
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401)
    };

    const agencyUserDetails: DbAgencyUserDto | undefined =
      await agencyUserServiceObj.getAgencyUserById(
        convertedAgencyCognitoUserId,
      );
    if (!agencyUserDetails) {
      global.logger.error("Agency User not found.", {
        filterOptions,
        agencyUserDetails,
      });
      throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);
    }

    return this.getAllAgencyCvDebitTransactionByFilterOptions(filterOptions);
  }

  async getAllAgencyCvDebitTransactionByFilterOptions(
    filterOptions: AgencyCvDebitTransactionListingFilterOptions,
  ) {
    return agencyCvDebitTransactionDao.getAllAgencyCvDebitTransactionByFilterOptions(
      filterOptions,
    );
  }
}

const agencyCvDebitTransactionServiceObj = new AgencyCvDebitTransactionService();
export {
  agencyCvDebitTransactionServiceObj,
  AgencyCvDebitTransactionService
};