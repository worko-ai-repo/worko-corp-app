// Import crypto for hash generation
import { createHash } from 'crypto';

// Import daos
import { candidateJobMatchingDaoObj } from "../daos/CandidateJobMatching.dao";

// Import dtos
import { CandidateJobMatchingListingFilterOptions } from "../dtos/CandidateJobMatching.dto";

// Import helpers
import { dateHelperObj } from "../helpers/date.helper";

// Import models
import { DbCandidateJobMatchingDto } from "../db/gcp-firestore-models/CandidateJobMatching.model";

// Import utils
import { BaseError } from "../utils/errors.util";
import HttpStatusCode from "../utils/http-codes.util";

class CandidateJobMatchingService {
  
  /**
   * Generate deterministic document ID for candidate job matching
   * 
   * @note
   *  1. Do not use monotonically increasing document IDs such as:
   *    Customer1, Customer2, Customer3, ...
   *    Product 1, Product 2, Product 3, ...
   *    Such sequential IDs can lead to hotspots that impact latency,
   *    so we are storing the IDs in a deterministic way.
   */
  private generateCandidateJobMatchingDocIdByCandEmailAndJobId(candidateEmail: string, jobId: string): string {
    const combined: string = `${candidateEmail}:${jobId}`;
    return createHash('sha256').update(combined).digest('hex').substring(0, 20);
  }

  /**
   * Create candidate job matching record
   */
  async createCandidateJobMatching(
    candidateEmail: string,
    jobId: string,
    companyId: string,
    additionalData: Partial<DbCandidateJobMatchingDto> 
  ): Promise<DbCandidateJobMatchingDto | undefined> {
    global.logger.info(`Create Candidate Job Matching [SERVICE]`, {
      methodName: this.createCandidateJobMatching.name,
    });

    // Check if matching already exists
    const existingMatching: DbCandidateJobMatchingDto | undefined = await this.getCandidateJobMatchingByEmailAndJobId(candidateEmail, jobId);
    if (existingMatching) {
      global.logger.error(`Candidate job matching already exists`, {
        methodName: this.createCandidateJobMatching.name,
        candidateEmail,
        jobId
      });
      throw new BaseError("Candidate job matching already exists.", HttpStatusCode.CONFLICT_409);
    }

    const documentId: string = this.generateCandidateJobMatchingDocIdByCandEmailAndJobId(candidateEmail, jobId);
    const currentTimestamp: string = dateHelperObj.getISODate();

    const createData: DbCandidateJobMatchingDto = {
      id: documentId,
      candidateEmail,
      companyId,
      jobId,
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp,
      isFindMatchingScoreInProgress: true,
      ...additionalData
    };

    return candidateJobMatchingDaoObj.createCandidateJobMatching(createData);
  }

  /**
   * Get candidate job matching by ID
   */
  async getCandidateJobMatchingById(id: string): Promise<DbCandidateJobMatchingDto | undefined> {
    global.logger.info(`Get Candidate Job Matching By ID [SERVICE]`, {
      methodName: this.getCandidateJobMatchingById.name,
      id
    });

    return candidateJobMatchingDaoObj.getCandidateJobMatchingById(id);
  }

  async getAllCandidateJobMatchingByFilterOptions(filterOptions: CandidateJobMatchingListingFilterOptions) {
    return candidateJobMatchingDaoObj.getAllCandidateJobMatchingByFilterOptions(filterOptions);
  }

  /**
   * Get candidate job matching by email and job ID
   */
  async getCandidateJobMatchingByEmailAndJobId(
    candidateEmail: string,
    jobId: string
  ): Promise<DbCandidateJobMatchingDto | undefined> {
    global.logger.info(`Get Candidate Job Matching By Email And Job ID [SERVICE]`, {
      methodName: this.getCandidateJobMatchingByEmailAndJobId.name,
      candidateEmail,
      jobId
    });

    const documentId: string = this.generateCandidateJobMatchingDocIdByCandEmailAndJobId(candidateEmail, jobId);
    return this.getCandidateJobMatchingById(documentId);
  }
}

const candidateJobMatchingServiceObj = new CandidateJobMatchingService();
export { candidateJobMatchingServiceObj, CandidateJobMatchingService };