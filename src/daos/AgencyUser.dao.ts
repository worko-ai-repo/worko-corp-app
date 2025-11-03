
// Import firestore package
import { DocumentData, Firestore, QuerySnapshot } from "@google-cloud/firestore";

// Import libraries
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { AgencyUserCommonUpdateDto } from "../dtos/AgencyUser.dto";
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import models
import { DbAgencyUserDto } from "../db/gcp-firestore-models/AgencyUser.model";

class AgencyUserDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyUsers";

  getAgencyUserModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
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