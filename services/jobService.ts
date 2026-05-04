import { generateJobDescription } from "../lib/openai";
import { getAllJobs, saveJob } from "../repositories/jobRepository";

export async function createJob(
  title: string,
  seniority: string,
  industry: string,
  responsibilities: string,
) {
  // generating the job description and ATS keywords via AI
  const generated = await generateJobDescription(
    title,
    seniority,
    industry,
    responsibilities,
  );

  // saving the generated job to storage
  const jobId = `job-${Date.now()}`;
  await saveJob(jobId, generated);

  return { jobId, generated };
}

// retrieving all available  jobs in the storage
export async function getJobs() {
  return getAllJobs();
}
