class AgencyUserSubmissionService {
  async createAgencyUserSubmission() {
   global.logger.info(`Create Agency User Submission [Service]`, {
      methodName: this.createAgencyUserSubmission.name,
   });
  }
}

const agencyUserSubmissionServiceObj = new AgencyUserSubmissionService();
export { agencyUserSubmissionServiceObj, AgencyUserSubmissionService };