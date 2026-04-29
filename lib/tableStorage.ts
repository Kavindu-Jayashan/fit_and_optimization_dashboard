import { TableClient } from "@azure/data-tables";

const tableClient = TableClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
  process.env.AZURE_TABLE_NAME!,
);

export async function getJobDescription(jobId: string){
    const entity = await tableClient.getEntity("jobs" , jobId);
    return entity;
}