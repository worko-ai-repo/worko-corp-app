// Import firestore package
import { Firestore, Settings, DocumentData, WriteResult, DocumentSnapshot } from "@google-cloud/firestore";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";

/**
 * Firestore overview
 * @see https://docs.cloud.google.com/firestore/native/docs/overview
 * 
 * SDK setup and initialize
 * @see https://docs.cloud.google.com/firestore/native/docs/create-database-server-client-library
 * 
 * Authenticate for using client libraries
 * @see https://docs.cloud.google.com/docs/authentication/client-libraries#node.js
 *
 * Data Model
 * @see https://docs.cloud.google.com/firestore/native/docs/data-model
 * 
 * Best practices for Cloud Firestore
 * @see https://firebase.google.com/docs/firestore/best-practices
 *
 * Basic CRUD
 * @see https://docs.cloud.google.com/nodejs/docs/reference/firestore/latest#using-the-client-library
 */
class GcpFirestoreLibrary {
  initFirestoreArguments(databaseId: string): Settings {
    const settings: Settings = {
      databaseId: databaseId,
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
    // if (process.env.APP_STAGE === APP_CONSTANTS.STAGES.LOCAL) {
    //   settings.ssl = false;
    // }

    return settings;
  }

  getFirestoreDatabase(databaseId: string): Firestore {
    return new Firestore(this.initFirestoreArguments(databaseId));
  }

  async createDocument<CreateDto extends DocumentData>(
    commonDbDetails: GcpFirestoreInteractionDto,
    data: CreateDto
  ): Promise<CreateDto | undefined> {
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
  async bulkCreateDocuments(
    commonDbDetails: GcpFirestoreInteractionDto,
    documents: any[]
  ) {
    const db: Firestore = this.getFirestoreDatabase(
      commonDbDetails.databaseName
    );
    const batch = db.batch();

    documents.forEach((doc) => {
      const docRef = db.collection(commonDbDetails.collectionName).doc();
      batch.set(docRef, { ...doc });
    });

    await batch.commit();
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

  /**
   * Get all documents in a collection
   * @see https://docs.cloud.google.com/firestore/native/docs/query-data/get-data#get_all_documents_in_a_collection
   *
   * Get multiple documents from a collection by certain conditions
   * @see https://docs.cloud.google.com/firestore/native/docs/query-data/get-data#get_multiple_documents_from_a_collection
   *
   * Query and filter data
   * @see https://docs.cloud.google.com/firestore/native/docs/query-data/queries
   *
   * Pagination And Sort Order
   * @see https://docs.cloud.google.com/firestore/native/docs/query-data/order-limit-data
   */
  async getDocuments(
    commonDbDetails: GcpFirestoreInteractionDto,
    field: string,
    value: any
  ) {
    const db: Firestore = this.getFirestoreDatabase(
      commonDbDetails.databaseName
    );
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

  async deleteDocumentById(
    commonDbDetails: GcpFirestoreInteractionDto,
    id: string
  ): Promise<void> {
    const db: Firestore = this.getFirestoreDatabase(
      commonDbDetails.databaseName
    );
    await db.collection(commonDbDetails.collectionName).doc(id).delete();
  }
}

export { GcpFirestoreLibrary };
