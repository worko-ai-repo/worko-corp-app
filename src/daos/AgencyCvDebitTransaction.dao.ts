// Import firestore package
import { DocumentData, FieldPath, Firestore, Query } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { AgencyCvDebitTransactionCreateDto, AgencyCvDebitTransactionListingFilterOptions } from "../dtos/AgencyCvDebitTransaction.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyCvDebitTransactionDto } from "../db/gcp-firestore-models/AgencyCvDebitTransaction.model";

// Import services
import UlidService from "../services/Ulid.service";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class AgencyCvDebitTransactionDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyCvDebitTransactions";

  getAgencyCvDebitTransactionModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyCvDebitTransactionFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createAgencyCvDebitTransaction(createDto: AgencyCvDebitTransactionCreateDto): Promise<DbAgencyCvDebitTransactionDto | undefined> {
    const date: string = dateHelperObj.getISODate();
    return gcpFirestoreLibrary.createDocument<DbAgencyCvDebitTransactionDto>(
      this.getAgencyCvDebitTransactionModelDetails(),
      {
        ...createDto,
        id: UlidService.getUlidId(),
        createdAt: date,
        updatedAt: date,
      },
    );
  }

  async getAllAgencyCvDebitTransactionByFilterOptions(
    filterOptions: AgencyCvDebitTransactionListingFilterOptions,
  ) {
    const db: Firestore =
      await this.getAgencyCvDebitTransactionFirestoreDatabase();
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
      AgencyCvDebitTransactionListingFilterOptions,
      DbAgencyCvDebitTransactionDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

const agencyCvDebitTransactionDao: AgencyCvDebitTransactionDao =
  new AgencyCvDebitTransactionDao();
export { agencyCvDebitTransactionDao, AgencyCvDebitTransactionDao };
