
// Import firestore package
import { DocumentData, Firestore, Query } from "@google-cloud/firestore";

// Import configs
import { gcpFirestoreLibrary } from "../configs/gcp-sdk.config";

// Import dtos
import { GcpFirestoreInteractionDto } from "../dtos/Common.dto";
import { CandidateParsedCvCorporateListingFilterOptions } from "../dtos/CandidateParsedCv.dto";

// Import daos
import BaseDao from "./BaseGcpFirestore.dao";

// Import models
import { DbCandidateParsedCvDto } from "../db/gcp-firestore-models/CandidateParsedCv.model";

// Import utils
import { gcpFirestoreUtilObj } from "../utils/gcp-firestore.util";
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CandidateParsedCvDao implements BaseDao {
  databaseName: string = `worko-corp-db-${process.env.APP_SLS_STAGE}`;
  collectionName: string = "candidateParsedCvs";

  getCandidateParsedCvModelDetails(): GcpFirestoreInteractionDto {
    return {
      databaseName: this.databaseName,
      collectionName: this.collectionName,
    };
  }

  getCandidateParsedCvFirestoreDatabase() {
    return gcpFirestoreLibrary.getFirestoreDatabase(this.databaseName);
  }

  async createCandidateParsedCv(createData: DbCandidateParsedCvDto) {
    global.logger.info(`Create Candidate Parsed CV [DAO]`, {
      methodName: this.createCandidateParsedCv.name,
    });

    return gcpFirestoreLibrary.createDocument<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      createData
    );
  }

  async getAllCandidateParsedCvsByIdsWithoutPagination(candidateParsedCvIds: string[]): Promise<DbCandidateParsedCvDto[]> {
    return gcpFirestoreLibrary.getAllDocumentsByIdsWithoutPagination<DbCandidateParsedCvDto>(
      this.getCandidateParsedCvModelDetails(),
      candidateParsedCvIds
    );
  }

  async getAllCandidateParsedCvsByCorporateFilterOptions(filterOptions: CandidateParsedCvCorporateListingFilterOptions) {
    const { 
      companyId,
      jobId,
      currentCompany,
      currentDesignation,
      totalYOE,
      relevantYOE,
      currentCTC,
      expectedCTC,
      noticePeriod,
      location,
      readyToRelocate,
      isNoticePeriodNegotiable
    } = filterOptions;

    if(!companyId) {
      throw new BaseError("CompanId is required", HttpStatusCode.BAD_REQUEST_400);
    }

    const db: Firestore = this.getCandidateParsedCvFirestoreDatabase();
    let baseQuery: Query<DocumentData, DocumentData> = db
      .collection(this.collectionName)
      .where("companyId", "==", companyId);

    if(jobId) baseQuery = baseQuery.where("jobId", "==", jobId);
    if(currentCompany) baseQuery = baseQuery.where("currentCompany", "==", currentCompany);
    if(currentDesignation) baseQuery = baseQuery.where("currentDesignation", "==", currentDesignation);
    if(totalYOE) baseQuery = baseQuery.where("totalYOE", "==", totalYOE);
    if(relevantYOE) baseQuery = baseQuery.where("relevantYOE", "==", relevantYOE);
    if(currentCTC) baseQuery = baseQuery.where("currentCTC", "==", currentCTC);
    if(expectedCTC) baseQuery = baseQuery.where("expectedCTC", "==", expectedCTC);
    if(noticePeriod) baseQuery = baseQuery.where("noticePeriod", "==", noticePeriod);
    if(location) baseQuery = baseQuery.where("location", "==", location);
    if(readyToRelocate) baseQuery = baseQuery.where("readyToRelocate", "==", readyToRelocate);
    if(isNoticePeriodNegotiable) baseQuery = baseQuery.where("isNoticePeriodNegotiable", "==", isNoticePeriodNegotiable);

    return gcpFirestoreUtilObj.paginateGcpFirestore<
      CandidateParsedCvCorporateListingFilterOptions,
      DbCandidateParsedCvDto
    >(db, this.collectionName, baseQuery, filterOptions);
  }
}

const candidateParsedCvDaoObj = new CandidateParsedCvDao();
export { candidateParsedCvDaoObj, CandidateParsedCvDao };