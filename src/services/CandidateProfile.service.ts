class CandidateProfileService {
  async createCandidateProfile() {
   global.logger.info(`Create Candidate Profile [Service]`, {
      methodName: this.createCandidateProfile.name,
   });
  }
}

const candidateProfileServiceObj = new CandidateProfileService();
export { candidateProfileServiceObj, CandidateProfileService };