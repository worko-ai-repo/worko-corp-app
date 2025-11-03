class CandidateCvParsedService {
  async createCandidateCvParsed() {
   global.logger.info(`Create Candidate CV Parsed [Service]`, {
      methodName: this.createCandidateCvParsed.name,
   });
  }
}

const candidateCvParsedServiceObj = new CandidateCvParsedService();
export { candidateCvParsedServiceObj, CandidateCvParsedService };