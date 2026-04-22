
// Import google cloud firestore
import { Firestore, WriteResult, QuerySnapshot, QueryDocumentSnapshot, DocumentData, WriteBatch, DocumentReference, Query, DocumentSnapshot } from "@google-cloud/firestore";

// Import configs
import APP_CONSTANTS from "../configs/constants.config";

// Import daos
import { centralCandidateProfileDaoObj } from "../daos/CentralCandidateProfile.dao";
import { candidateParsedCvDaoObj } from "../daos/CandidateParsedCv.dao";
import { agencyUserSubmissionDaoObj } from "../daos/AgencyUserSubmission.dao";
import { agencyAnalyticsDaoObj } from "../daos/AgencyAnalytics.dao";

// Import dtos
import { CandidateParsedCvAwsS3FileTrackerDto } from "../dtos/CandidateParsedCv.dto";
import { GcpFirestoreRecordListingResponseDTO } from "../dtos/Common.gcp-firestore.dto";

// Import enums
import { InvokeLambdaHandlerEventTypeEnum } from "../enums/InvokeLambda.enum";
import { CandidateParsedCvAwsS3ResourceTypeEnum } from "../enums/CandidateParsedCv.enum";

// Import models
import { DbCentralCandidateProfileDto } from "../db/gcp-firestore-models/CentralCandidateProfile.model";
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";
import { DbCorporateCandidateProfileDto } from "../db/gcp-firestore-models/CorporateCandidateProfile.model";
import { DbAgencyUserSubmissionDto } from "../db/gcp-firestore-models/AgencyUserSubmission.model";
import { DbAgencyAnalyticsDto } from "../db/gcp-firestore-models/AgencyAnalytics.model";

// Import services
import { centralCandidateProfileServiceObj } from "./CentralCandidateProfile.service";
import InvokeLambdaService from "./InvokeLambda.service";
import { corporateCandidateProfileServiceObj } from "./CorporateCandidateProfile.service";
import { candidateParsedCvServiceObj } from "./CandidateParsedCv.service";
import { AgencyUserSubmissionDbJobApplicationStatusEnum } from "../enums/AgencyUserSubmission.enum";
import { dateHelperObj } from "../helpers/date.helper";
import { DbCompanyDetailDto } from "../db/aws-dynamodb-models/CompanyDetail.model";
import { companyDetailServiceObj } from "./CompanyDetail.service";
import { companyJobServiceObj } from "./CompanyJob.service";

class ScriptService {
   async seedAgencyAnalyticsFromAgencyUserSubmissions(
      companyId: string,
      dryRun: boolean = false
   ): Promise<{
      companyId: string;
      dryRun: boolean;
      scannedSubmissions: number;
      upsertedDocs: number;
      aggregates: number;
   }> {
      global.logger.info("Seed agency analytics from agency user submissions started. [Service]", {
         companyId,
         dryRun,
         methodName: this.seedAgencyAnalyticsFromAgencyUserSubmissions.name,
         fileName: __filename,
      });

      const db: Firestore = await agencyUserSubmissionDaoObj.getAgencyUserSubmissionFirestoreDatabase();
      const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await db
         .collection(agencyUserSubmissionDaoObj.collectionName)
         .where("companyId", "==", companyId)
         .get();

      const corporateCompanyName = await companyDetailServiceObj.getCompanyDetailById(companyId);

      type AggregateCounters = {
         acceptedCount: number;
         agencyId: string;
         agencyName: string;
         companyId: string;
         companyName?: string;
         hiredCount: number;
         inProcessCount: number;
         rejectedCount: number;
         jobAssignedDate?: string;
         jobId: string;
         jobTitle?: string;
         submittedCount: number;
         totalCandidates: number;
      };

      const aggregateMap: Map<string, AggregateCounters> = new Map();

      querySnapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData, DocumentData>) => {
         const item = doc.data() as DbAgencyUserSubmissionDto;
         const agencyId: string = item.agencyUserId;
         const jobId: string = item.jobId;
         const key: string = `${companyId}_${agencyId}_${jobId}`;

         if (!aggregateMap.has(key)) {
            aggregateMap.set(key, {
               acceptedCount: 0,
               agencyId,
               agencyName: item.agencyName ?? "",
               companyId,
               ...(corporateCompanyName[0] ? { companyName: corporateCompanyName[0].name } : {}),
               hiredCount: 0,
               inProcessCount: 0,
               jobAssignedDate: item.createdAt,
               jobId,
               jobTitle: undefined,
               rejectedCount: 0,
               submittedCount: 0,
               totalCandidates: 0,
            });
         }

         const aggregate: AggregateCounters = aggregateMap.get(key)!;
         aggregate.submittedCount += 1;
         aggregate.totalCandidates += 1;

         if (item.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.ACCEPTED) {
            aggregate.acceptedCount += 1;
         } else if (
            item.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.UNDER_EVALUATION ||
            item.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.PROCESSING_INTERVIEW
         ) {
            aggregate.inProcessCount += 1;
         } else if (item.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.REJECTED) {
            aggregate.rejectedCount += 1;
         } else if (
            item.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.HIRED ||
            item.jobApplicationStatus === AgencyUserSubmissionDbJobApplicationStatusEnum.JOINED
         ) {
            aggregate.hiredCount += 1;
         }
      });

      if (dryRun) {
         return {
            aggregates: aggregateMap.size,
            companyId,
            dryRun: true,
            scannedSubmissions: querySnapshot.docs.length,
            upsertedDocs: 0,
         };
      }

      const currentDate: string = dateHelperObj.getISODate();
      let upsertedDocs: number = 0;
      // create a set of unique jobIds to fetch job details in batch
      const uniqueJobIds: Set<string> = new Set(
         Array.from(aggregateMap.values()).map((aggregate) => aggregate.jobId)
      );

      // fetch job details in batch and create a map of jobId to jobTitle
      const jobDetails: Map<string, { title: string }> = new Map(
         await Promise.all(
         Array.from(uniqueJobIds).map(async (jobId): Promise<[string, { title: string }]> => {
            const jobDetail = await companyJobServiceObj.getJobById(jobId);
            return [jobId, jobDetail[0] ? { title: jobDetail[0].jobTitle } : { title: "" }];
         })
         )
      );

      /**
       * If the document doesn't exist, create a new one with the aggregate data and metadata fields.
       * If the document already exists, update the existing document with the new aggregate data and metadata fields.
       */
      for (const [docId, aggregate] of aggregateMap.entries()) {
         const existing: DbAgencyAnalyticsDto | undefined =
            await agencyAnalyticsDaoObj.getAgencyAnalyticsById(docId);

         // enrich aggregate with job title from job details map
         const jobDetail = jobDetails.get(aggregate.jobId);
         aggregate.jobTitle = jobDetail ? jobDetail.title : "";

         if (!existing) {
            const createData: DbAgencyAnalyticsDto = {
               ...aggregate,
               createdAt: currentDate,
               id: docId,
               lastActivityAt: currentDate,
               lastEventId: `SEED_${companyId}`,
               lastEventType: "SEED_BACKFILL",
               updatedAt: currentDate,
            };
            await agencyAnalyticsDaoObj.createAgencyAnalytics(createData);
         } else {
            await agencyAnalyticsDaoObj.updateAgencyAnalyticsById(docId, {
               acceptedCount: aggregate.acceptedCount,
               agencyName: aggregate.agencyName,
               companyName: aggregate.companyName,
               hiredCount: aggregate.hiredCount,
               inProcessCount: aggregate.inProcessCount,
               jobAssignedDate: aggregate.jobAssignedDate,
               jobTitle: aggregate.jobTitle,
               lastActivityAt: currentDate,
               lastEventId: `SEED_${companyId}`,
               lastEventType: "SEED_BACKFILL",
               rejectedCount: aggregate.rejectedCount,
               submittedCount: aggregate.submittedCount,
               totalCandidates: aggregate.totalCandidates,
               updatedAt: currentDate,
            });
         }

         upsertedDocs += 1;
      }

      return {
         aggregates: aggregateMap.size,
         companyId,
         dryRun: false,
         scannedSubmissions: querySnapshot.docs.length,
         upsertedDocs,
      };
   }

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

   async scriptToAddCandNameInCorporateCandidateProfileAsync() {
      return InvokeLambdaService.triggerWorkoCorpAppInvokeLambdaTrigger({
         eventType: InvokeLambdaHandlerEventTypeEnum.SCRIPT_TO_ADD_CAND_NAME_IN_CORPORATE_CANDIDATE_PROFILES,
         data: {}
      })
   }

   async scriptToAddCandNameInCentralCandidateProfileAsync() {
      return InvokeLambdaService.triggerWorkoCorpAppInvokeLambdaTrigger({
         eventType: InvokeLambdaHandlerEventTypeEnum.SCRIPT_TO_ADD_CAND_NAME_IN_CENTRAL_CANDIDATE_PROFILES,
         data: {}
      })
   }

   async scriptToAddCandNameInCentralCandidateProfile() {
      const centralCandidateProfiles: DbCentralCandidateProfileDto[] = await centralCandidateProfileServiceObj.getAllCentralCandidateProfileByFilterOptionsWithoutPagination({
         pageSize: 1000
      });
      
      // Filter out profiles without latestCandidateParsedCvId
      const validProfiles = centralCandidateProfiles.filter(profile => profile.latestCandidateParsedCvId);
      
      const uniqueCandidateParsedCvIds: string[] = Array.from(
        new Set(
          validProfiles.map(
            (item: DbCentralCandidateProfileDto) => item.latestCandidateParsedCvId
         )
        )
      );

      const candidateParsedCvs: Map<string, DbCandidateParsedCvDto> = await candidateParsedCvServiceObj.getCandidateParsedCvDetailsMapByIds(uniqueCandidateParsedCvIds);
      
      const updateCentralCandidateData: {
         id: string;
         updateData: Partial<DbCentralCandidateProfileDto>;
      }[] = validProfiles.map((centralCandidateProfile: DbCentralCandidateProfileDto) => {
         const candidateParsedCv: DbCandidateParsedCvDto | undefined = candidateParsedCvs.get(centralCandidateProfile.latestCandidateParsedCvId);
         return {
            id: centralCandidateProfile.id,
            updateData: {
               candidateName: candidateParsedCv?.name.toLowerCase() || "",
               candidateProfileInCompaniesList: centralCandidateProfile?.candidateProfileInCompanies?.map((item) => item.companyName.toUpperCase())
            }
         };
      });
      
      global.logger.info(`Processing ${updateCentralCandidateData.length} central candidate profiles for name update`);
      
      const response: boolean = await centralCandidateProfileServiceObj.scriptAddCandNameInCentralCandidateProfile(updateCentralCandidateData);
      
      global.logger.info(`Central candidate profile update completed: ${response}`);
      
      return response;
   }
   
   async scriptToAddCandNameInCorporateCandidateProfile() {
      const corporateCandidateProfiles: GcpFirestoreRecordListingResponseDTO<DbCorporateCandidateProfileDto[]> = await corporateCandidateProfileServiceObj.scriptGetAllCorporateCandidateProfileForCandNameAdd(1000);
      const uniqueCandidateParsedCvIds: string[] = Array.from(
        new Set(
          corporateCandidateProfiles.data.map(
            (item: DbCorporateCandidateProfileDto) => item.candidateParsedCvId
         )
        )
      );

      const candidateParsedCvs: Map<string, DbCandidateParsedCvDto> = await candidateParsedCvServiceObj.getCandidateParsedCvDetailsMapByIds(uniqueCandidateParsedCvIds);
      
      const updateCorporateCandidateData: {
         id: string;
         updateData: {
            candidateName: string;
         };
      }[] = corporateCandidateProfiles.data.map((corporateCandidateProfile: DbCorporateCandidateProfileDto) => {
         const candidateParsedCv: DbCandidateParsedCvDto | undefined = candidateParsedCvs.get(corporateCandidateProfile.candidateParsedCvId);
         return {
            id: corporateCandidateProfile.id,
            updateData: {
               candidateName: candidateParsedCv?.name.toLowerCase() || ""
            }
         };
      });
      
      const updateCorporateCandidate = await corporateCandidateProfileServiceObj.scriptAddCandNameInCorporateCandidateProfile(updateCorporateCandidateData);
   }
}

const scriptServiceObj = new ScriptService();
export { scriptServiceObj, ScriptService };