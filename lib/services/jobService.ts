import { CreateJobInput, JobRecord } from "./../types/job";
import { IJobGenerationService } from "../interfaces/IJobGenerationService";
import { IJobRepository } from "../interfaces/IJobRepository";

export function createJobService(
  jobRepo: IJobRepository,
  generationService: IJobGenerationService,
) {
  // creating the job
  async function CreateJob(input: CreateJobInput): Promise<{ jobId: string }> {
    const { title, seniority, industry, responsibilities } = input;

    const generated = await generationService.generate(
      title,
      seniority,
      industry,
      responsibilities,
    );
    const jobId = `job-${Date.now()}`;
    await jobRepo.save(jobId, generated);
    return { jobId };
  }

  // retrieve all job listings
  async function getAllJobs(): Promise<JobRecord[]> {
    return jobRepo.findAll();
  }

  // retrieve a single job for detailed view
  async function getJobById(jobId: string): Promise<JobRecord | null> {
    const job = await jobRepo.findById(jobId);
    if (!job) throw new Error(`Job with id ${jobId} not found`);
    return job;
  }

  // update a specific job by job id
  async function updateJob(
    jobId: string,
    updates: Partial<JobRecord>,
  ): Promise<void> {
    await jobRepo.update(jobId, updates);
  }

  return { CreateJob, getAllJobs, getJobById , updateJob };
}
