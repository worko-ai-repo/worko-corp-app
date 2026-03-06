
// Import dtos
import { AgencyCvCreditTransactionCreateDto, AgencyCvCreditTransactionListingFilterOptions } from "../dtos/AgencyCvCreditTransaction.dto";

// Import daos
import {
  agencyCvCreditTransactionDao
} from "../daos/AgencyCvCreditTransaction.dao";

// Import helpers
import { getActionByAgencyUserIds } from "../helpers/user.helper";

// import services
import { agencyUserServiceObj } from "./AgencyUser.service";

// Import models
import { DbAgencyCvCreditTransactionDto } from "../db/gcp-firestore-models/AgencyCvCreditTransaction.model";
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyCvCreditTransactionService {
  async createAgencyCvCreditTransaction(createDto: AgencyCvCreditTransactionCreateDto): Promise<DbAgencyCvCreditTransactionDto | undefined> {
    return agencyCvCreditTransactionDao.createAgencyCvCreditTransaction(
      createDto,
    );
  }

  async performGetAllAgencyCvCreditTransactionByFilterOptions(filterOptions: AgencyCvCreditTransactionListingFilterOptions) {
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

    return this.getAllAgencyCvCreditTransactionByFilterOptions(filterOptions);
  }

  async getAllAgencyCvCreditTransactionByFilterOptions(
    filterOptions: AgencyCvCreditTransactionListingFilterOptions,
  ) {
    return agencyCvCreditTransactionDao.getAllAgencyCvCreditTransactionByFilterOptions(
      filterOptions,
    );
  }
}

const agencyCvCreditTransactionServiceObj = new AgencyCvCreditTransactionService();
export {
  agencyCvCreditTransactionServiceObj,
  AgencyCvCreditTransactionService
};