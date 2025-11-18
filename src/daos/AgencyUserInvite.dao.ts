
// Import firestore package
import { DocumentData, Filter, Firestore, Query, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { AgencyUserInviteCommonUpdateDto, AgencyUserInviteCreateApiDto, AgencyUserInviteCreateDto, AgencyUserInviteDbPhoneNumberDto, AgencyUserInviteListingFilterOptions } from "../dtos/AgencyUserInvite.dto";
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbAgencyUserInviteDto } from "../db/gcp-firestore-models/AgencyUserInvite.model";

// Import services
import UlidService from "../services/Ulid.service";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";

class AgencyUserInviteDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "agencyUserInvites";

  getAgencyUserInviteModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getAgencyUserInviteFirestoreDatabase(): Firestore {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createAgencyUserInvite(
    createDto: AgencyUserInviteCreateDto
  ): Promise<DbAgencyUserInviteDto | undefined> {
    global.logger.info("Create Agency User Invite [DAO]", {
      methodName: this.createAgencyUserInvite.name,
      createDto,
    });

    const currentDate: string = dateHelperObj.getISODate();

    const finalCreateData: DbAgencyUserInviteDto = {
      id: UlidService.getUlidId(),
      createdAt: currentDate,
      updatedAt: currentDate,
      ...createDto,
    };

    return gcpFirestoreLibrary.createDocument<DbAgencyUserInviteDto>(
      this.getAgencyUserInviteModelDetails(),
      finalCreateData
    );
  }

  async getAllAgencyUserInvitesByFilterOptions(
    filterOptions: AgencyUserInviteListingFilterOptions
  ): Promise<GcpFirestoreRecordListingResponseDTO<DbAgencyUserInviteDto[]>> {
    global.logger.info("Get All Agency User Invites [DAO]", {
      methodName: this.getAllAgencyUserInvitesByFilterOptions.name,
    });

    const { companyId, invitedByCorporateUserId, inviteStatus, agencyEmail } =
      filterOptions;

    const db: Firestore = this.getAgencyUserInviteFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db.collection(
      this.collectionName
    );

    // If no filter options are provided, order by createdAt in specific order
    if(!companyId && !invitedByCorporateUserId && !inviteStatus && !agencyEmail) {
      baseQuery = baseQuery.orderBy("createdAt", filterOptions.sortOrder);
    } else {
      if (companyId) baseQuery = baseQuery.where("companyId", "==", companyId);
      if (invitedByCorporateUserId)
        baseQuery = baseQuery.where(
          "invitedByCorporateUserId",
          "==",
          invitedByCorporateUserId
        );
      if (inviteStatus)
        baseQuery = baseQuery.where("inviteStatus", "==", inviteStatus);
      if (agencyEmail) baseQuery = baseQuery.where("email", "==", agencyEmail);
    }

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyUserInviteListingFilterOptions,
      DbAgencyUserInviteDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }

  async getAgencyUserInviteById(
    id: string
  ): Promise<DbAgencyUserInviteDto | undefined> {
    global.logger.info("Get Agency User Invite [DAO]", {
      methodName: this.getAgencyUserInviteById.name,
      id,
    });

    return gcpFirestoreLibrary.getDocumentById<DbAgencyUserInviteDto>(
      this.getAgencyUserInviteModelDetails(),
      id
    );
  }

  /**
   * @description This function is user before creating the Agency User Invite, so that we can check if
   * an invite with few attributes already exists or not
   * @reference 
   *  1. "performCreateAgencyUserInviteActivities" method in "AgencyUserInvite.service.ts"
   */
  async getAgencyUserInviteDuplicateDataBeforeCreate(
    data: AgencyUserInviteCreateApiDto
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info("Get Agency User Invite Duplicate Data Before Create [DAO]", {
      methodName: this.getAgencyUserInviteDuplicateDataBeforeCreate.name,
      data,
    });

    const {
      companyId,
      email: agencyInvitedEmail,
      phoneNumberDetails,
      agencyName,
      GSTIN
    } = data

    const db: Firestore = this.getAgencyUserInviteFirestoreDatabase();

    /**
     * @see https://firebase.google.com/docs/firestore/query-data/queries#or_queries
     */
    const duplicateFilters: Filter[] = [
      Filter.where("email", "==", agencyInvitedEmail),
      Filter.where("companyEmailDomainName", "==", agencyInvitedEmail.split("@")[1]),
      Filter.and(
        Filter.where("phoneNumberDetails.number", "==", phoneNumberDetails.number),
        Filter.where("phoneNumberDetails.countryCode", "==", phoneNumberDetails.countryCode)
      ),
      Filter.where("agencyName", "==", agencyName),
    ];

    if (GSTIN) {
      duplicateFilters.push(Filter.where("GSTIN", "==", GSTIN));
    }

    return db
      .collection(this.collectionName)
      .where("companyId", "==", companyId) // duplicates should be detected within the same company.
      .where(Filter.or(...duplicateFilters))
      .get();
  }

  async updateAgencyUserInviteById(
    id: string,
    data: Partial<AgencyUserInviteCommonUpdateDto>
  ): Promise<DbAgencyUserInviteDto | undefined> {
    global.logger.info("Update Agency User Invite By Id [DAO]", {
      methodName: this.updateAgencyUserInviteById.name,
      id,
      data,
    });

    return gcpFirestoreLibrary.updateDocumentById<
      Partial<AgencyUserInviteCommonUpdateDto>,
      DbAgencyUserInviteDto
    >(this.getAgencyUserInviteModelDetails(), id, data);
  }
}

const agencyUserInviteDaoObj = new AgencyUserInviteDao();
export { agencyUserInviteDaoObj, AgencyUserInviteDao };