// Import firestore package
import { Firestore, Settings, DocumentData, WriteResult, DocumentSnapshot, WriteBatch, DocumentReference } from "@google-cloud/firestore";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

/**
 * Firestore overview
 * @see https://docs.cloud.google.com/firestore/native/docs/overview
 */
class GcpFirestoreLibrary {
  initFirestoreArguments(databaseId: string): Settings {
    const settings: Settings = {
      databaseId: databaseId,
      ignoreUndefinedProperties: true,
    };

    if (process.env.APP_GCP_PROJECT_ID) {
      settings.projectId = process.env.APP_GCP_PROJECT_ID;
    }

    if (process.env.APP_GCP_CLIENT_EMAIL && process.env.APP_GCP_PRIVATE_KEY) {
      settings.credentials = {
        client_email: process.env.APP_GCP_CLIENT_EMAIL,
        private_key: process.env.APP_GCP_PRIVATE_KEY,
      };
    }

    /**
     * @todo: Implement emulator if running locally
     */

    return settings;
  }

  getFirestoreDatabase(databaseId: string): Firestore {
    return new Firestore(this.initFirestoreArguments(databaseId));
  }

  async createDocument<DbEntityDto extends DocumentData>(
    commonDbDetails: GcpFirestoreInteractionDto,
    data: DbEntityDto
  ): Promise<DbEntityDto | undefined> {
    const db: Firestore = this.getFirestoreDatabase(
      commonDbDetails.databaseName
    );

    /*
    Sample response:
    {
      "_writeTime": {
          "_seconds": 1761890072,
          "_nanoseconds": 924397000
      }
    }
    */
    const response: WriteResult = await db
      .collection(commonDbDetails.collectionName)
      .doc(data.id)
      .set({ ...data });

    if (!response) {
      return undefined;
    }

    return data;
  }

  /**
   * Batched writes
   * @see https://docs.cloud.google.com/firestore/native/docs/manage-data/transactions#batched-writes
   */
  async bulkCreateDocument<DbEntityDto extends DocumentData>(
    commonDbDetails: GcpFirestoreInteractionDto,
    documents: DbEntityDto[]
  ) {
    const db: Firestore = this.getFirestoreDatabase(
      commonDbDetails.databaseName
    );

    // Get a new write batch
    const batch: WriteBatch = db.batch();

    documents.forEach((doc: DbEntityDto) => {
      const docRef: DocumentReference<DocumentData, DocumentData> = db.collection(commonDbDetails.collectionName).doc(doc.id);
      batch.set(docRef, { ...doc });
    });

    const response: WriteResult[] = await batch.commit();
    global.logger.info("Bulk Create Document Response", {
      responseLength: response.length,
    });

    if (!response || !response.length || response.length !== documents.length) {
      return false;
    }

    return true;
  }

  async getDocumentById<DbEntityDto>(
    commonDbDetails: GcpFirestoreInteractionDto,
    id: string
  ): Promise<DbEntityDto | undefined> {
    const db: Firestore = this.getFirestoreDatabase(
      commonDbDetails.databaseName
    );
    const doc: DocumentSnapshot<DocumentData, DocumentData> = await db
      .collection(commonDbDetails.collectionName)
      .doc(id)
      .get();

    if (!doc.exists) {
      return undefined;
    }

    return doc.data() as DbEntityDto;
  }

  async updateDocumentById<UpdateEntityDto extends DocumentData, DbEntityDto>(
    commonDbDetails: GcpFirestoreInteractionDto,
    id: string,
    data: UpdateEntityDto
  ): Promise<DbEntityDto | undefined> {
    const db: Firestore = this.getFirestoreDatabase(
      commonDbDetails.databaseName
    );

    const response: WriteResult = await db
      .collection(commonDbDetails.collectionName)
      .doc(id)
      .update(data);

    if (!response) {
      return undefined;
    }

    // Fetch the updated document
    const updatedDoc: DocumentSnapshot<DocumentData, DocumentData> = await db
      .collection(commonDbDetails.collectionName)
      .doc(id)
      .get();

    if (!updatedDoc.exists) {
      return undefined;
    }

    return updatedDoc.data() as DbEntityDto;
  }
}

export { GcpFirestoreLibrary };
