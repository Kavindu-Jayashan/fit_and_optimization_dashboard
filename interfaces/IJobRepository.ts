import { GeneratedJob, JobRecord } from "../types/job";

export interface IJobRepository {
  save(jobId: string, job: GeneratedJob): Promise<void>;
  findAll(): Promise<JobRecord[]>;
  findById(jobId: string): Promise<JobRecord | null>;
}
