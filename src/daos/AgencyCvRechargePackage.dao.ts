// Import firestore package
import { DocumentData, Firestore, Query } from "@google-cloud/firestore";

// Import libraries
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { AgencyCvRechargePackageListingFilterOptions } from "../dtos/AgencyCvRechargePackage.dto";

// Import models
import { DbAgencyCvRechargePackageDto } from "../db/gcp-firestore-models/AgencyCvRechargePackage.model";
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class AgencyCvRechargePackageDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyCvRechargePackages";

  getAgencyCvRechargePackageModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyCvRechargePackageFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createAgencyCvRechargePackage(
    createDto: DbAgencyCvRechargePackageDto,
  ): Promise<DbAgencyCvRechargePackageDto | undefined> {
    return gcpFirestoreLibrary.createDocument<DbAgencyCvRechargePackageDto>(
      this.getAgencyCvRechargePackageModelDetails(),
      createDto,
    );
  }

  async getAgencyCvRechargePackageById(agencyCvRechargePackageId: string) {
    return gcpFirestoreLibrary.getDocumentById<DbAgencyCvRechargePackageDto>(
      this.getAgencyCvRechargePackageModelDetails(),
      agencyCvRechargePackageId,
    );
  }

  async getAllAgencyCvRechargePackageByFilterOptions(
    filterOptions: AgencyCvRechargePackageListingFilterOptions,
  ) {
    const db: Firestore =
      await this.getAgencyCvRechargePackageFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName,
    );

    if (filterOptions.isActiveForPurchase) {
      baseQuery = baseQuery.where(
        "isActiveForPurchase",
        "==",
        filterOptions.isActiveForPurchase,
      );
    }

    if (filterOptions.sortOrder) {
      baseQuery = baseQuery.orderBy("totalCvCount", filterOptions.sortOrder);
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyCvRechargePackageListingFilterOptions,
      DbAgencyCvRechargePackageDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }

  async getAgencyCvRechargePackageByTotalCvCount(totalCvCount: number) {
    const db: Firestore =
      await this.getAgencyCvRechargePackageFirestoreDatabase();
    return db.collection(this.collectionName).where("totalCvCount", "==", totalCvCount).get();
  }
}

const agencyCvRechargePackageDaoObj = new AgencyCvRechargePackageDao();
export { agencyCvRechargePackageDaoObj, AgencyCvRechargePackageDao };
