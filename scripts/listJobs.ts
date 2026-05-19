import { TableClient } from "@azure/data-tables";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const client = TableClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
  process.env.AZURE_TABLE_NAME!
);

async function main() {
  const entities = client.listEntities({
    queryOptions: { filter: "PartitionKey eq 'jobs'" },
  });
  for await (const e of entities) {
    console.log(String(e.rowKey), "|", String(e.title), "|", String(e.seniority));
  }
}

main();