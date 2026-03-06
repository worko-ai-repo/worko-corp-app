
import { DocumentData, Firestore, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import models
import { DbAgencyCvRechargeOrderDto } from "../db/gcp-firestore-models/AgencyCvRechargeOrder.model";

class AgencyCvRechargeOrderDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyCvRechargeOrders";

  getAgencyCvRechargeOrderModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyCvRechargeOrderFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createAgencyCvRechargeOrder(createDto: DbAgencyCvRechargeOrderDto): Promise<DbAgencyCvRechargeOrderDto | undefined> {
    return gcpFirestoreLibrary.createDocument<DbAgencyCvRechargeOrderDto>(
      this.getAgencyCvRechargeOrderModelDetails(),
      createDto
    )
  }

  async getAgencyCvRechargeOrderByAgencyUserIdAndPgOrderId(agencyUserId: string, patmentGatewayOrderId: string): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    const db: Firestore = await this.getAgencyCvRechargeOrderFirestoreDatabase();
    return db
      .collection(this.collectionName)
      .where("agencyUserId", "==", agencyUserId)
      .where("paymentGatewayOrderId", "==", patmentGatewayOrderId)
      .get();
  }

  async updateAgencyCvRechargeOrderById(
    id: string,
    updateDto: Partial<DbAgencyCvRechargeOrderDto>,
  ): Promise<DbAgencyCvRechargeOrderDto | undefined> {
    return gcpFirestoreLibrary.updateDocumentById<Partial<DbAgencyCvRechargeOrderDto>,DbAgencyCvRechargeOrderDto>(
      this.getAgencyCvRechargeOrderModelDetails(),
      id,
      updateDto
    );
  }
}

const agencyCvRechargeOrderDao = new AgencyCvRechargeOrderDao();
export {
  agencyCvRechargeOrderDao,
  AgencyCvRechargeOrderDao
};