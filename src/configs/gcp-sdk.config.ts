// Import libraries
import { GcpFirestoreLibrary } from "../libraries/gcp-firestore.library";

const gcpFirestoreLibrary: GcpFirestoreLibrary = new GcpFirestoreLibrary();
global.logger.info(`The "Gcp Firestore Library" initialized successfully.`);

export { gcpFirestoreLibrary };
