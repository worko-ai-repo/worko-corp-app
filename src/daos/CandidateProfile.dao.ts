// Import firestore package
import { DocumentData, Filter, Firestore, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { CandidateProfileDbPhoneNumberDto } from "../dtos/CandidateProfile.dto";

// Import models
import { DbCandidateProfileDto } from "../db/gcp-firestore-models/CandidateProfile.model";

class CandidateProfileDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "candidateProfiles";

  getCandidateProfileModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getCandidateProfileFirestoreDatabase(): Firestore {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createCandidateProfile(
    createData: DbCandidateProfileDto
  ): Promise<DbCandidateProfileDto | undefined> {
    return gcpFirestoreLibrary.createDocument<DbCandidateProfileDto>(
      this.getCandidateProfileModelDetails(),
      createData
    );
  }

  async getDuplicateCandidateProfile(
    companyId: string,
    candidateEmailId: string,
    phoneNumberDetails: CandidateProfileDbPhoneNumberDto
  ): Promise<
    QuerySnapshot<
      DocumentData,
      DocumentData
    >
  > {
    const db: Firestore = this.getCandidateProfileFirestoreDatabase();

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
}

const candidateProfileDaoObj = new CandidateProfileDao();
export { candidateProfileDaoObj, CandidateProfileDao };