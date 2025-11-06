
// Import firestore package
import { DocumentData, Firestore, Query, QuerySnapshot } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import dtos
import { AgencyUserInviteCommonUpdateDto, AgencyUserInviteCreateDto, AgencyUserInviteListingFilterOptions } from "../dtos/AgencyUserInvite.dto";
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

    return gcpFirestoreLibrary.createDocument<DbAgencyUserInviteDto>(
      this.getAgencyUserInviteModelDetails(),
      {
        id: UlidService.getUlidId(),
        createdAt: currentDate,
        updatedAt: currentDate,
        ...createDto,
      }
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

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      AgencyUserInviteListingFilterOptions,
      DbAgencyUserInviteDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }

  async getAgencyUserInviteByCompIdEmailAndInvitedByUserId(
    companyId: string,
    agencyInvitedEmail: string,
    invitedByCorporateUserId: string
  ): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    global.logger.info("Get Agency User Invite [DAO]", {
      methodName: this.getAgencyUserInviteByCompIdEmailAndInvitedByUserId.name,
      companyId,
      agencyInvitedEmail,
      invitedByCorporateUserId,
    });

    const db: Firestore = this.getAgencyUserInviteFirestoreDatabase();

    return db
      .collection(this.collectionName)
      .where("companyId", "==", companyId)
      .where("email", "==", agencyInvitedEmail)
      .where("invitedByCorporateUserId", "==", invitedByCorporateUserId)
      .get();
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