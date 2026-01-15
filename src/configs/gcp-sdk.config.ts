// Import libraries
import { GcpAiPlatformEmbeddingLibrary } from "../libraries/gcp-aiplatform-embedding.library";
import { GcpFirestoreLibrary } from "../libraries/gcp-firestore.library";

const gcpFirestoreLibrary: GcpFirestoreLibrary = new GcpFirestoreLibrary();
global.logger.info(`The "Gcp Firestore Library" initialized successfully.`);

const gcpAiPlatformEmbeddingLibrary: GcpAiPlatformEmbeddingLibrary = new GcpAiPlatformEmbeddingLibrary();
global.logger.info(`The "Gcp AI Platform Library" initialized successfully.`);

export { 
   gcpFirestoreLibrary, 
   gcpAiPlatformEmbeddingLibrary,
};