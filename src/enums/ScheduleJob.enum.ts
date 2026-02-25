
export enum ScheduleJobType {
  /**
   * ADMIN_CAND_ACCOUNT_CREATE_SIGNUP_REMINDER
   * @description
   *    1. Whenever the agency submits a unregistered candidate for a job,
   *       if `corporate-recruiter/admin` or `worko-admin` moves the candidate to applicant then
   *       we are creating his account from backend with temporary password and the email,temporary
   *       password will be sent to the candidate as reminder message.
   */
  ADMIN_CAND_ACCOUNT_CREATE_SIGNUP_REMINDER = "ADMIN_CAND_ACCOUNT_CREATE_SIGNUP_REMINDER",

  /**
   * BLACK_LISTED_USER_JOB_APPLICATION_STATUS_UPDATE
   * 
   * Whenever thr `corporate` mark candidate as `BLACK_LISTED` for his company
   * And at that time whenever candidate applies a job for corporate's company, then
   * we allow candidate to apply job and after few hours we update the status to `REJECTED` by 
   * using this schedule job
   */
  BLACK_LISTED_USER_JOB_APPLICATION_STATUS_UPDATE = "BLACK_LISTED_USER_JOB_APPLICATION_STATUS_UPDATE",
}

/**
 * ScheduleJobStatus
 *
 * @enum {string}
 * @description Enumeration for the status of scheduled jobs. These statuses reflect the current state of a scheduled job, from scheduling to completion or failure.
 */
export enum ScheduleJobStatus {
  /**
   * @description Indicates that the job has been successfully scheduled and is awaiting execution. The job is in the queue and will be triggered at the specified time.
   */
  SCHEDULED = "SCHEDULED",

  /**
   * @description Indicates that the job's trigger process has successfully started. This means the scheduled job has begun execution as intended.
   */
  TRIGGER_PROCESS_SUCCESS = "TRIGGER_PROCESS_SUCCESS",

  /**
   * @description Indicates that the job's trigger process failed to start. This could be due to system errors or issues in the job's configuration, requiring intervention to retry or reschedule.
   */
  TRIGGER_PROCESS_FAILED = "TRIGGER_PROCESS_FAILED",

  /**
   * @description Indicates that the job has failed during its execution. The failure could be due to various reasons such as network issues, system errors, or invalid job parameters.
   */
  FAILED = "FAILED",

  /**
   * @description Indicates that the job has been completed successfully. The job has executed all its tasks and processes as expected without errors.
   */
  COMPLETED = "COMPLETED",
}
