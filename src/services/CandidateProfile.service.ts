
// Import google cloud firestore
import { DocumentData, QuerySnapshot } from "@google-cloud/firestore";

// Import daos
import { candidateProfileDaoObj } from "../daos/CandidateProfile.dao";

// Import dtos
import { CandidateProfileDbPhoneNumberDto } from "../dtos/CandidateProfile.dto";

// Import models
import { DbCandidateProfileDto } from "../db/gcp-firestore-models/CandidateProfile.model";


class CandidateProfileService {
   async createCandidateProfile(createData: DbCandidateProfileDto): Promise<DbCandidateProfileDto | undefined> { 
      global.logger.info(`Create Candidate Profile [Service]`, {
         methodName: this.createCandidateProfile.name,
      });

      return candidateProfileDaoObj.createCandidateProfile(createData);
   }

   async getDuplicateCandidateProfile(
      companyId: string,
      candidateEmailId: string,
      phoneNumberDetails: CandidateProfileDbPhoneNumberDto
   ): Promise<
       QuerySnapshot<
         DocumentData,
         DocumentData
       >
     >  {
      global.logger.info(`Get Duplicate Candidate Profile [Service]`, {
         methodName: this.getDuplicateCandidateProfile.name,
      });

      return candidateProfileDaoObj.getDuplicateCandidateProfile(
         companyId,
         candidateEmailId,
         phoneNumberDetails
      );
   }
}

const candidateProfileServiceObj = new CandidateProfileService();
export { candidateProfileServiceObj, CandidateProfileService };