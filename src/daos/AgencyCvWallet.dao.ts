import { Firestore } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { AgencyCvWalletCreateDto } from "../dtos/AgencyCvWallet.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyCvWalletDto } from "../db/gcp-firestore-models/AgencyCvWallet.model";

class AgencyCvWalletDao implements BaseDao  {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyCvWallets";

  getAgencyCvWalletModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyCvWalletFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createAgencyCvWallet(data: AgencyCvWalletCreateDto): Promise<DbAgencyCvWalletDto | undefined> {
    const date: string = dateHelperObj.getISODate();
    return gcpFirestoreLibrary.createDocument<DbAgencyCvWalletDto>(
      this.getAgencyCvWalletModelDetails(),
      {
        ...data,
        id: data.agencyUserId,
        createdAt: date,
        updatedAt: date,
      }
    );
  }

  async getAgencyCvWalletById(id: string): Promise<DbAgencyCvWalletDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbAgencyCvWalletDto>(
      this.getAgencyCvWalletModelDetails(),
      id
    );
  }

  async updateAgencyCvWalletById(id: string, data: Partial<DbAgencyCvWalletDto>): Promise<DbAgencyCvWalletDto | undefined> {
    const date: string = dateHelperObj.getISODate();
    return gcpFirestoreLibrary.updateDocumentById<Partial<DbAgencyCvWalletDto>, DbAgencyCvWalletDto>(
      this.getAgencyCvWalletModelDetails(),
      id,
      data
    );
  }
}

const agencyCvWalletDaoObj = new AgencyCvWalletDao();
export {
  agencyCvWalletDaoObj,
  AgencyCvWalletDao
};