
// Import firestore package
import { DocumentData, FieldPath, Firestore, Query } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { AgencyCvCreditTransactionCreateDto, AgencyCvCreditTransactionListingFilterOptions } from "../dtos/AgencyCvCreditTransaction.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyCvCreditTransactionDto } from "../db/gcp-firestore-models/AgencyCvCreditTransaction.model";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";
import UlidService from "../services/Ulid.service";

class AgencyCvCreditTransactionDao implements BaseDao  {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyCvCreditTransactions";

  getAgencyCvCreditTransactionModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyCvCreditTransactionFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createAgencyCvCreditTransaction(
    data: AgencyCvCreditTransactionCreateDto
  ): Promise<DbAgencyCvCreditTransactionDto | undefined> {
    const date: string = dateHelperObj.getISODate();
    return gcpFirestoreLibrary.createDocument<DbAgencyCvCreditTransactionDto>(
      this.getAgencyCvCreditTransactionModelDetails(),
      {
        ...data,
        id: UlidService.getUlidId(),
        createdAt: date,
        updatedAt: date,
      },
    );
  }

  async getAllAgencyCvCreditTransactionByFilterOptions(
    filterOptions: AgencyCvCreditTransactionListingFilterOptions,
  ) {
    const db: Firestore =
      await this.getAgencyCvCreditTransactionFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName,
    );

    if (filterOptions.agencyUserId) {
      baseQuery = baseQuery.where("agencyUserId", "==", filterOptions.agencyUserId);
    }

    if (filterOptions.sortOrder) {
      baseQuery = baseQuery.orderBy(FieldPath.documentId(), filterOptions.sortOrder);
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyCvCreditTransactionListingFilterOptions,
      DbAgencyCvCreditTransactionDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

const agencyCvCreditTransactionDao: AgencyCvCreditTransactionDao = new AgencyCvCreditTransactionDao();
export { agencyCvCreditTransactionDao, AgencyCvCreditTransactionDao };