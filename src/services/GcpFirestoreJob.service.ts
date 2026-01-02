// Import daos
import { gcpFirestoreJobDaoObj } from "../daos/GcpFirestoreJob.dao";

// Import models
import { DbGcpFirestoreJobDto } from "../db/gcp-firestore-models/GcpFirestoreJob.model";

class GcpFirestoreJobService {
  async getJobById(id: string): Promise<DbGcpFirestoreJobDto | undefined> {
    return gcpFirestoreJobDaoObj.getJobById(id);
  }

  async getJobsByIds(ids: string[]): Promise<DbGcpFirestoreJobDto[]> {
    return gcpFirestoreJobDaoObj.getJobsByIds(ids);
  }

  async getJobDetailsMapByIds(
    jobIds: string[]
  ): Promise<Map<string, DbGcpFirestoreJobDto>> {
    const retrievedJobDetails: DbGcpFirestoreJobDto[] =
      await this.getJobsByIds(jobIds);

    return new Map(
      retrievedJobDetails.map((job: DbGcpFirestoreJobDto) => [job.id, job])
    );
  }
}

const gcpFirestoreJobServiceObj = new GcpFirestoreJobService();
export { gcpFirestoreJobServiceObj, GcpFirestoreJobService };
