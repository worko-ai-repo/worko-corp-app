// Import firestore package
import { DocumentData, Filter, Firestore, Query, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { CorporateCandidateProfileDbPhoneNumberDto, CorporateCandidateProfileListingFilterOptions } from "../dtos/CorporateCandidateProfile.dto";

// Import models
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class CorporateCandidateProfileDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "corporateCandidateProfiles";

  getCorporateCandidateProfileModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getCorporateCandidateProfileFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createCorporateCandidateProfile(
    createData: DbCorporateCandidateProfileDto
  ): Promise<DbCorporateCandidateProfileDto | undefined> {
    return gcpFirestoreLibrary.createDocument<DbCorporateCandidateProfileDto>(
      this.getCorporateCandidateProfileModelDetails(),
      createData
    );
  }

  async getDuplicateCorporateCandidateProfile(
    companyId: string,
    candidateEmailId: string,
    phoneNumberDetails: CorporateCandidateProfileDbPhoneNumberDto
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    const db: Firestore = await this.getCorporateCandidateProfileFirestoreDatabase();

    return db
      .collection(this.collectionName)
      .where("companyId", "==", companyId)
      .where(
        Filter.or(
          Filter.where("candidateEmail", "==", candidateEmailId),
          Filter.and(
            Filter.where(
              "phoneNumberDetails.number",
              "==",
              phoneNumberDetails.number
            ),
            Filter.where(
              "phoneNumberDetails.countryCode",
              "==",
              phoneNumberDetails.countryCode
            )
          )
        )
      )
      .get();
  }

  async getAllCorporateCandidateProfileByFilterOptions(
    filterOptions: CorporateCandidateProfileListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbCorporateCandidateProfileDto[]>> {
    const { refereeType, companyId, candidateEmail } = filterOptions;

    const db: Firestore = await this.getCorporateCandidateProfileFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    );

    if(!refereeType && !companyId && !candidateEmail) {
      baseQuery = baseQuery.orderBy("createdAt", filterOptions.sortOrder);
    } else {
      if (refereeType) baseQuery = baseQuery.where("refereeType", "==", refereeType);
      if (companyId) baseQuery = baseQuery.where("companyId", "==", companyId);
      if (candidateEmail) baseQuery = baseQuery.where("candidateEmail", "==", candidateEmail);
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      CorporateCandidateProfileListingFilterOptions,
      DbCorporateCandidateProfileDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

const corporateCandidateProfileDaoObj = new CorporateCandidateProfileDao();
export { corporateCandidateProfileDaoObj, CorporateCandidateProfileDao };