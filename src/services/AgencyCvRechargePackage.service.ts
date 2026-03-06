// Import dtos
import APP_CONSTANTS from "../configs/constants.config";

// Import dtos
import {
  AgencyCvRechargePackageCreateApiDto,
  AgencyCvRechargePackageListingFilterOptions,
} from "../dtos/AgencyCvRechargePackage.dto";

// Import daos
import { agencyCvRechargePackageDaoObj } from "../daos/AgencyCvRechargePackage.dao";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";
import { getActionByUserId } from "../helpers/user.helper";

// Import services
import UlidService from "../services/Ulid.service";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class AgencyCvRechargePackageService {
  async createAgencyCvRechargePackage(
    agencyCvRechargePackageCreateDto: AgencyCvRechargePackageCreateApiDto,
  ) {
    const cognitoUserGroups: string[] =
      global.requestLocalContext.cognitoUserGroups;
    const { actionByUserId } = getActionByUserId();
    if (
      !actionByUserId ||
      !cognitoUserGroups.includes(
        APP_CONSTANTS.COGNITO_IDENTITY_POOL_GROUPS.ADMIN,
      )
    ) {
      global.logger.error(`User is not a worko admin.`, {
        actionByUserId,
        cognitoUserGroups,
        methodName: this.createAgencyCvRechargePackage.name,
      });
      throw new BaseError("Unauthorized.", HttpStatusCode.UNAUTHORIZED_401);
    }

    const { amountPerCv, totalCvCount, isActiveForPurchase, description } =
      agencyCvRechargePackageCreateDto;

    const existingPackage = await this.getAgencyCvRechargePackageByTotalCvCount(
      totalCvCount,
    );
    if (!existingPackage.empty) {
      throw new BaseError("Package already exists.", HttpStatusCode.BAD_REQUEST_400);
    }

    const date: string = dateHelperObj.getISODate();
    const documentId: string = UlidService.getUlidId();

    return agencyCvRechargePackageDaoObj.createAgencyCvRechargePackage({
      id: documentId,
      createdAt: date,
      updatedAt: date,
      amountPerCv,
      totalCvCount,
      totalAmount: amountPerCv * totalCvCount,
      isActiveForPurchase,
      description,
      createdByUserId: actionByUserId,
    });
  }

  async getAgencyCvRechargePackageByTotalCvCount(totalCvCount: number) {
    return agencyCvRechargePackageDaoObj.getAgencyCvRechargePackageByTotalCvCount(
      totalCvCount,
    );
  }

  async getAgencyCvRechargePackageById(agencyCvRechargePackageId: string) {
    return agencyCvRechargePackageDaoObj.getAgencyCvRechargePackageById(
      agencyCvRechargePackageId,
    );
  }

  async getAllAgencyCvRechargePackageByFilterOptions(
    filterOptions: AgencyCvRechargePackageListingFilterOptions,
  ) {
    return agencyCvRechargePackageDaoObj.getAllAgencyCvRechargePackageByFilterOptions(
      filterOptions,
    );
  }
}

const agencyCvRechargePackageServiceObj = new AgencyCvRechargePackageService();
export { agencyCvRechargePackageServiceObj, AgencyCvRechargePackageService };
