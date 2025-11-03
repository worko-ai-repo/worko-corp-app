class AgencyJobAssignmentService {
  async createAgencyJobAssignment() {
   global.logger.info(`Create Agency Job Assignment [Service]`, {
      methodName: this.createAgencyJobAssignment.name,
   });
  }
}

const agencyJobAssignmentServiceObj = new AgencyJobAssignmentService();
export { agencyJobAssignmentServiceObj, AgencyJobAssignmentService };