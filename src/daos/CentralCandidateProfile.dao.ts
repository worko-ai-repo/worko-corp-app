// Import firestore package
import { DocumentData, FieldPath, Filter, Firestore, Query, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { CentralCandidateProfileDbPhoneNumberDto, CentralCandidateProfileListingFilterOptions } from "../dtos/CentralCandidateProfile.dto";

// Import models
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class CentralCandidateProfileDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "centralCandidateProfiles";

  getCentralCandidateProfileModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getCentralCandidateProfileFirestoreDatabase(): Promise<Firestore> {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createCentralCandidateProfile(
    createData: DbCentralCandidateProfileDto
  ): Promise<DbCentralCandidateProfileDto | undefined> {
    return gcpFirestoreLibrary.createDocument<DbCentralCandidateProfileDto>(
      this.getCentralCandidateProfileModelDetails(),
      createData
    );
  }

  async getCentralCandidateProfileById(id: string): Promise<DbCentralCandidateProfileDto | undefined> {
    return gcpFirestoreLibrary.getDocumentById<DbCentralCandidateProfileDto>(
      this.getCentralCandidateProfileModelDetails(),
      id
    );
  }

  async getDuplicateCentralCandidateProfile(candidateEmailId: string, phoneNumberDetails: CentralCandidateProfileDbPhoneNumberDto): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    const db: Firestore = await this.getCentralCandidateProfileFirestoreDatabase();

    return db
      .collection(this.collectionName)
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

  async getCentralCandidateProfileByCandName(candidateName: string): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    const db: Firestore = await this.getCentralCandidateProfileFirestoreDatabase();

    return db
      .collection(this.collectionName)
      .where("candidateName", "==", candidateName)
      .get();
  }

  async getAllCentralCandidateProfileByFilterOptions(
    filterOptions: CentralCandidateProfileListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbCentralCandidateProfileDto[]>> {
    const { refereeType, searchText, sortOrder, companyName } = filterOptions;

    const db: Firestore = await this.getCentralCandidateProfileFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    );

    if(searchText) {
      if(
        searchText?.includes("@")
      ) {
        const candidateEmail: string = searchText.toLowerCase();
        const candProfileById: DbCentralCandidateProfileDto | undefined = await this.getCentralCandidateProfileById(candidateEmail);
        const candProfileResponse: GcpFirestoreRecordListingResponseDTO<DbCentralCandidateProfileDto[]> = {
          data: candProfileById ? [candProfileById] : [],
          pagination: {
            count: candProfileById ? 1 : 0,
            pageSize: filterOptions.pageSize,
            sortOrder: sortOrder,
          }
        }
        return candProfileResponse;
      } else {
        const candidateName: string = searchText.toLowerCase();
        const candProfileByCandName: QuerySnapshot<DocumentData, DocumentData> = await this.getCentralCandidateProfileByCandName(candidateName);
        const candProfileResponse: GcpFirestoreRecordListingResponseDTO<DbCentralCandidateProfileDto[]> = {
          data: candProfileByCandName.docs.map((doc) => doc.data() as DbCentralCandidateProfileDto),
          pagination: {
            count: candProfileByCandName.docs.length,
            pageSize: filterOptions.pageSize,
            sortOrder: sortOrder,
          }
        }
        return candProfileResponse;
      }
    } else {
      if(companyName) {
        baseQuery = baseQuery.where("candidateProfileInCompaniesList", 'array-contains-any', 
          [companyName]
        );
      }
      if (refereeType) baseQuery = baseQuery.where("refereeType", "==", refereeType);
      if (sortOrder) baseQuery = baseQuery.orderBy("createdAt", sortOrder);
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      CentralCandidateProfileListingFilterOptions,
      DbCentralCandidateProfileDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }

  async updateCentralCandidateProfileById(
    id: string, // candidate email
    updateData: Partial<DbCentralCandidateProfileDto>
  ) {
    return gcpFirestoreLibrary.updateDocumentById<Partial<DbCentralCandidateProfileDto>,DbCentralCandidateProfileDto>(
      this.getCentralCandidateProfileModelDetails(),
      id,
      updateData
    );
  }

  async scriptAddCandNameInCentralCandidateProfile(updateCentralCandidateData: { id: string; updateData: Partial<DbCentralCandidateProfileDto> }[]) {
    return gcpFirestoreLibrary.bulkUpdateDocumentByIdsWithDifferentData<Partial<DbCentralCandidateProfileDto>>(this.getCentralCandidateProfileModelDetails(), updateCentralCandidateData);
  }
}

const centralCandidateProfileDaoObj = new CentralCandidateProfileDao();
export { centralCandidateProfileDaoObj, CentralCandidateProfileDao };