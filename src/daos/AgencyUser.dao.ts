
// Import firestore package
import { DocumentData, Firestore, QuerySnapshot } from "@google-cloud/firestore";

// Import libraries
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { AgencyUserCommonUpdateDto, AgencyUserCreateDto } from "../dtos/AgencyUser.dto";
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

// Import services
import UlidService from "../services/Ulid.service";

class AgencyUserDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyUsers";

  getAgencyUserModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  async createAgencyUser(
    createDto: AgencyUserCreateDto
  ): Promise<DbAgencyUserDto | undefined> {
    global.logger.info(`Create Agency User [Service]`, {
      methodName: this.createAgencyUser.name,
    });

    const currentDate: string = dateHelperObj.getISODate();

    const finalCreateData: DbAgencyUserDto = {
      ...createDto,
      id: UlidService.convertUuidToUlid(createDto.cognitoUserId),
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    return gcpFirestoreLibrary.createDocument<DbAgencyUserDto>(
      this.getAgencyUserModelDetails(),
      finalCreateData
    );
  }

  async getAgencyUserByRegisteredEmail(
    registeredEmail: string
  ): Promise<
    QuerySnapshot<
      DocumentData,
      DocumentData
    >
  > {
    global.logger.info(`Get Agency User By Registered Email [Service]`, {
      methodName: this.getAgencyUserByRegisteredEmail.name,
      registeredEmail,
    });
    const db: Firestore = gcpFirestoreLibrary.getFirestoreDatabase(
      this.databaseName
    );

    return db
      .collection(this.collectionName)
      .where("email", "==", registeredEmail)
      .get();
  }

  async getAgencyUserById(id: string): Promise<DbAgencyUserDto | undefined> {
    global.logger.info(`Get Agency User By Id [Service]`, {
      methodName: this.getAgencyUserById.name,
      id,
    });
    return gcpFirestoreLibrary.getDocumentById<DbAgencyUserDto>(
      this.getAgencyUserModelDetails(),
      id
    );
  }

  async updateAgencyUserById(id: string, data: Partial<AgencyUserCommonUpdateDto>): Promise<DbAgencyUserDto | undefined> {
    global.logger.info(`Update Agency User By Id [Service]`, {
      methodName: this.updateAgencyUserById.name,
      id,
      data
    });

    return gcpFirestoreLibrary.updateDocumentById<Partial<AgencyUserCommonUpdateDto>, DbAgencyUserDto>(
      this.getAgencyUserModelDetails(),
      id,
      data
    );
  }
}

const agencyUserDaoObj = new AgencyUserDao();
export { agencyUserDaoObj, AgencyUserDao };