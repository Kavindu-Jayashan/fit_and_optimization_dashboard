import { GeneratedJob } from "../types/job";

export interface IJobGenerationService {
  generate(
    title: string,
    seniority: string,
    industry: string,
    responsibilities: string,
  ): Promise<GeneratedJob>;
}
