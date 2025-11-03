
// Import daos
import { agencyUserDaoObj } from "../daos/AgencyUser.dao";

// Import dtos
import { AgencyUserCommonUpdateDto } from "../dtos/AgencyUser.dto";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

class AgencyUserService {
  async createAgencyUser() {
   global.logger.info(`Create Agency User [Service]`, {
      methodName: this.createAgencyUser.name,
   });
  }

  async getAgencyUserByRegisteredEmail(
    registeredEmail: string
  ) {
    global.logger.info(`Get Agency User By Registered Email [Service]`, {
      methodName: this.getAgencyUserByRegisteredEmail.name,
      registeredEmail,
    });
    return agencyUserDaoObj.getAgencyUserByRegisteredEmail(registeredEmail);
  }

  async updateAgencyUserById(id: string, data: Partial<AgencyUserCommonUpdateDto>): Promise<DbAgencyUserDto | undefined> {
    global.logger.info(`Update Agency User By Id [Service]`, {
      methodName: this.updateAgencyUserById.name,
      id,
      data
    });

    return agencyUserDaoObj.updateAgencyUserById(id, data);
  }
}

const agencyUserServiceObj = new AgencyUserService();
export { agencyUserServiceObj, AgencyUserService };