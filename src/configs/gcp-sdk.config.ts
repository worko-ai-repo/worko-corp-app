// Import libraries
import { GcpFirestoreLibrary } from "../libraries/gcp-firestore.library";
import { GcpVertexAiLibrary } from "../libraries/gcp-vertexai.library";

const gcpFirestoreLibrary: GcpFirestoreLibrary = new GcpFirestoreLibrary();
global.logger.info(`The "Gcp Firestore Library" initialized successfully.`);

const gcpVertexAiLibrary: GcpVertexAiLibrary = new GcpVertexAiLibrary();
global.logger.info(`The "Gcp Vertex AI Library" initialized successfully.`);

export { gcpFirestoreLibrary, gcpVertexAiLibrary };