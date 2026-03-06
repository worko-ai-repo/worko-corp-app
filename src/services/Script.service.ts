
// Import google cloud firestore
import { Firestore, WriteResult, QuerySnapshot, QueryDocumentSnapshot, DocumentData, WriteBatch, DocumentReference, Query, DocumentSnapshot } from "@google-cloud/firestore";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import daos
import { centralCandidateProfileDaoObj } from "../daos/CentralCandidateProfile.dao";
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";

// Import dtos
import { CandidateParsedCvAwsS3FileTrackerDto } from "../dtos/CandidateParsedCv.dto";

// Import enums
import { InvokeLambdaHandlerEventTypeEnum } from "../enums/InvokeLambda.enum";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";

// Import models
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Import services
import { centralCandidateProfileServiceObj } from "./CentralCandidateProfile.service";
import InvokeLambdaService from "./InvokeLambda.service";

class ScriptService {
   async scriptToConvertCentralCandidateProfileEmailToLowerCaseAsync() {
      // return InvokeLambdaService.triggerWorkoCorpAppInvokeLambdaTrigger({
      //    eventType: InvokeLambdaHandlerEventTypeEnum.SCRIPT_TO_CONVERT_EMAIL_TO_LOWERCASE,
      //    data: {}
      // })
   }

   static async scriptToConvertCentralCandidateProfileEmailToLowerCase() {
      const emailIds =
        process.env.APP_STAGE === APP_CONSTANTS.STAGES.PROD
          ? [

            ]
          : [

            ];

      const migrationPromises = emailIds.map(async (email: string) => {
         const profile: DbCentralCandidateProfileDto | undefined = await centralCandidateProfileServiceObj.getCentralCandidateProfileById(email);
         if (profile) {
            const lowercaseEmail: string = email.toLowerCase();
            
            // Create new document with lowercase ID and email
            const newProfile: DbCentralCandidateProfileDto = {
               ...profile,
               id: lowercaseEmail,
               candidateEmail: lowercaseEmail
            };
            
            const createdProfile: DbCentralCandidateProfileDto | undefined = await centralCandidateProfileServiceObj.createCentralCandidateProfile(newProfile);
            if (!createdProfile) {
               global.logger.error("Failed to create new profile.", {
                  methodName: this.scriptToConvertCentralCandidateProfileEmailToLowerCase.name,
                  email,
                  existingOldProfile: profile
               });
               return;
            }
            
            // Delete old document
            const db: Firestore= await centralCandidateProfileDaoObj.getCentralCandidateProfileFirestoreDatabase();
            const deleteResult: WriteResult = await db.collection(centralCandidateProfileDaoObj.collectionName).doc(email).delete();
            
            return { oldId: email, newId: lowercaseEmail };
         }
      });

      const results = await Promise.allSettled(migrationPromises);
      
      global.logger.info("Email migration results", {
         total: emailIds.length,
         successful: results.filter(r => r.status === 'fulfilled').length,
         failed: results.filter(r => r.status === 'rejected').length
      });

      return results;
   }

   static async scriptToAppendDotPdfInCvAwsS3FileCandidateParsedCv() {
      const db: Firestore = await candidateParsedCvDaoObj.getCandidateParsedCvFirestoreDatabase();
      
      let allDocumentsToUpdate: { id: string; cvAwsS3FileName: string; cvAwsS3FileTracker: CandidateParsedCvAwsS3FileTrackerDto[]; }[] = [];
      let totalProcessed: number = 0;
      let lastDocId: string | null = null;

      // Paginate through all documents
      while (true) {
         let query: Query<DocumentData, DocumentData> = db
            .collection(candidateParsedCvDaoObj.collectionName)
            .where("cvAwsS3ResourceType", "==", CandidateParsedCvAwsS3ResourceTypeEnum.ADMIN_CAND_BULK_CV_UPLOAD)
            .limit(1000);

         if (lastDocId) {
            const docSnapshot: DocumentSnapshot<DocumentData, DocumentData> = await db
               .collection(candidateParsedCvDaoObj.collectionName)
               .doc(lastDocId)
               .get();
            query = query.startAfter(docSnapshot);
         }

         const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await query.get();
         
         if (querySnapshot.empty) break;

         querySnapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
            const data = doc.data() as DbCandidateParsedCvDto;
            
            if (data.cvAwsS3FileName && !data.cvAwsS3FileName.endsWith(".pdf")) {
               const updateData = { 
                  id: data.id,
                  cvAwsS3FileName: `${data.cvAwsS3FileName}.pdf`,
                  cvAwsS3FileTracker: [
                     {
                        ...data.cvAwsS3FileTracker[0],
                        fileName: `${data.cvAwsS3FileName}.pdf`
                     }
                  ]
               };
               allDocumentsToUpdate.push(updateData);
            }
         });

         totalProcessed += querySnapshot.docs.length;
         lastDocId = querySnapshot.docs[querySnapshot.docs.length - 1].data().id;
         
         global.logger.info(`Processed batch: ${querySnapshot.docs.length} documents, Total processed: ${totalProcessed}`);
      }

      if (allDocumentsToUpdate.length === 0) {
         global.logger.info("No documents found that need PDF extension update");
         return { totalUpdated: 0, documentsToUpdateLength: 0, totalProcessed };
      }

      // Process updates in batches of 200 (Firestore batch limit)
      const batchSize: number = 250;
      let totalUpdated: number = 0;
      
      for (let i = 0; i < allDocumentsToUpdate.length; i += batchSize) {
         const batch: WriteBatch = db.batch();
         const batchDocuments: {
           id: string;
           cvAwsS3FileName: string;
           cvAwsS3FileTracker: CandidateParsedCvAwsS3FileTrackerDto[];
         }[] = allDocumentsToUpdate.slice(i, i + batchSize);
         
         batchDocuments.forEach(({ id, cvAwsS3FileName, cvAwsS3FileTracker }) => {
            const docRef: DocumentReference<DocumentData, DocumentData> = db.collection(candidateParsedCvDaoObj.collectionName).doc(id);
            batch.update(docRef, { cvAwsS3FileName, cvAwsS3FileTracker });
         });

         const response: WriteResult[] = await batch.commit();
         totalUpdated += response.length;
         
         global.logger.info(`Updated batch: ${response.length} documents`);
      }
      
      global.logger.info("PDF extension update completed", {
         documentsToUpdateLength: allDocumentsToUpdate.length,
         totalProcessed,
         totalUpdated
      });

      return { totalUpdated, documentsToUpdateLength: allDocumentsToUpdate.length, totalProcessed };
   }

   async scriptToAppendDotPdfInCvAwsS3FileCandidateParsedCvAsync() {
      // return InvokeLambdaService.triggerWorkoCorpAppInvokeLambdaTrigger({
      //    eventType: InvokeLambdaHandlerEventTypeEnum.SCRIPT_TO_APPEND_DOT_PDF,
      //    data: {}
      // })
   }
}

const scriptServiceObj = new ScriptService();
export { scriptServiceObj, ScriptService };