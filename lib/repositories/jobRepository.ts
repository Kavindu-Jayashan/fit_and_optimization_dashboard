import { TableClient } from "@azure/data-tables";
import { IJobRepository } from "../interfaces/IJobRepository";
import { GeneratedJob, JobRecord } from "../types/job";

export function createJobRepo(): IJobRepository {
  const tableClient = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING!,
    process.env.AZURE_TABLE_NAME!,
  );

  async function save(jobId: string, job: GeneratedJob): Promise<void> {
    await tableClient.upsertEntity({
      partitionKey: "jobs",
      rowKey: jobId,
      title: String(job.title),
      seniority: String(job.seniority),
      industry: String(job.industry),
      description: String(job.jobDescription),
      requirements: [
        ...job.atsKeywords.hardSkills,
        ...job.atsKeywords.softSkills,
      ].join(", "),
      atsKeywordsJson: JSON.stringify(job.atsKeywords),
      createdAt: new Date().toISOString(),
    });
  }

  async function findAll(): Promise<JobRecord[]> {
    const jobs: JobRecord[] = [];
    const entities = tableClient.listEntities({
      queryOptions: { filter: "PartitionKey eq 'jobs'" },
    });

    for await (const entity of entities) {
      try {
        // Test parse before pushing to catch corrupted records
        if (entity.atsKeywordsJson) {
          JSON.parse(String(entity.atsKeywordsJson));
        }
      } catch (e) {
        console.error(
          "Corrupted atsKeywordsJson for rowKey:",
          entity.rowKey,
          String(entity.atsKeywordsJson).substring(0, 100),
        );
      }
      jobs.push({
        rowKey: String(entity.rowKey),
        title: String(entity.title ?? ""),
        seniority: String(entity.seniority ?? ""),
        industry: String(entity.industry ?? ""),
        description: String(entity.description ?? entity.jobDescription ?? ""),
        requirements: String(entity.requirements ?? ""),
        atsKeywordsJson: String(entity.atsKeywordsJson ?? ""),
      });
    }
    return jobs;
  }

  async function findById(jobId: string): Promise<JobRecord | null> {
    const all = await findAll();
    return all.find((job) => job.rowKey === jobId) ?? null;
  }

  async function update(jobId: string, updates: Partial<JobRecord>) {
    await tableClient.upsertEntity({
      partitionKey: "jobs",
      rowKey: jobId,
      ...Object.fromEntries(
        Object.entries(updates).map(([key, value]) => [
          key,
          String(value ?? ""),
        ]),
      ),
    });
  }

  return { save, findAll, findById, update };
}
