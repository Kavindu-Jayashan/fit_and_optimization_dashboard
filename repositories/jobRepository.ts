import { description } from "./../components/chart-area-interactive";
import { TableClient } from "@azure/data-tables";
import { GeneratedJob } from "../lib/openai";

const tableClient = TableClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
  process.env.AZURE_TABLE_NAME!,
);

export async function saveJob(jobId: string, generated: GeneratedJob) {
  await tableClient.upsertEntity({
    partitionKey: "jobs",
    rowKey: jobId,
    title: String(generated.title),
    seniority: String(generated.seniority),
    industry: String(generated.industry),
    description: String(generated.jobDescription),
    requirements: [
      ...generated.atsKeywords.hardSkills,
      ...generated.atsKeywords.softSkills,
    ].join(","),
    atsKeywordsJson: JSON.stringify(generated.atsKeywords),
    createdAt: new Date().toISOString(),
  });
}

export async function getAllJobs() {
  const jobs = [];
  const entities = tableClient.listEntities({
    queryOptions: { filter: "PartitionKey eq 'jobs'" },
  });

  for await (const entity of entities) {
    jobs.push({
      rowKey: entity.rowKey,
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
