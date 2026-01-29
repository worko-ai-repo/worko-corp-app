
// Import daos
import { agencyCvWalletDaoObj } from "../daos/AgencyCvWallet.dao";

// Import dtos
import { AgencyCvWalletCreateDto } from "../dtos/AgencyCvWallet.dto";

// Import helpers
import { getActionByAgencyUserIds } from "../helpers/user.helper";

// Import models
import { DbAgencyCvWalletDto } from "../db/gcp-firestore-models/AgencyCvWallet.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyCvWalletService {
  async performGetAgencyCvWalletByIdActivities(id: string): Promise<DbAgencyCvWalletDto | undefined> {
    const {
      convertedAgencyCognitoUserId
    } = getActionByAgencyUserIds();

    if(id !== convertedAgencyCognitoUserId) throw new BaseError(`Unauthorized.`, HttpStatusCode.UNAUTHORIZED_401);

    return this.getAgencyCvWalletById(id);
  }

  async getAgencyCvWalletById(id: string): Promise<DbAgencyCvWalletDto | undefined> {
    return agencyCvWalletDaoObj.getAgencyCvWalletById(id);
  }

  async createAgencyCvWallet(data: AgencyCvWalletCreateDto): Promise<DbAgencyCvWalletDto | undefined> {
    return agencyCvWalletDaoObj.createAgencyCvWallet(data);
  }

  async updateAgencyCvWalletById(id: string, data: Partial<DbAgencyCvWalletDto>): Promise<DbAgencyCvWalletDto | undefined> {
    return agencyCvWalletDaoObj.updateAgencyCvWalletById(id, data);
  }
}

const agencyCvWalletServiceObj = new AgencyCvWalletService();
export {
  AgencyCvWalletService,
  agencyCvWalletServiceObj
};