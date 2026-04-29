import { BlobServiceClient } from "@azure/storage-blob";
import { TableClient } from "@azure/data-tables";
import * as dotenv from "dotenv";
import { title } from "process";

dotenv.config({ path: ".env" });

const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER_NAME!;
const TABLE_NAME = process.env.AZURE_TABLE_NAME!;

async function testBlobStorage() {
  console.log("\n--- Testing Blob Storage ---\n");

  try {
    const client = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    const container = client.getContainerClient(CONTAINER_NAME);

    const exists = await container.exists();
    if (!exists) {
      console.log(`container ${CONTAINER_NAME} does not exist. Creating...`);
      await container.create();
      console.log(` Container ${CONTAINER_NAME} created successfully`);
    } else {
      console.log(` Container ${CONTAINER_NAME} exists`);
    }

    const testContent = "This is test cv file";
    const testBlobName = `test-${Date.now()}.txt`;
    const blockBlob = container.getBlockBlobClient(testBlobName);
    await blockBlob.upload(testContent, testContent.length);
    console.log(`test file uploaded: ${testBlobName}`);

    await blockBlob.delete();
    console.log(`test file deleted: ${testBlobName}`);
  } catch (err: any) {
    console.log(" Blob storage test failed ", err.message);
  }
}

async function testTableStorage() {
  console.log("\n---Testing Table Storage---\n");

  try {
    const client = TableClient.fromConnectionString(
      CONNECTION_STRING,
      TABLE_NAME,
    );

    const testEntity = {
      partitionKey: "jobs",
      rowKey: "test-job-001",
      title: "Test Job",
      description: "This is a test job Description",
      requirements: "Testing , Node.js, Azure",
    };
    await client.upsertEntity(testEntity);
    console.log(` Test entity  inserted into "${TABLE_NAME}"`);

    const fetched = client.getEntity("jobs", "test-job-001");
    console.log(`Test Entity fetched`, {
      title: (await fetched).title,
      rowKey: (await fetched).rowKey,
    });

    await client.deleteEntity("jobs", "test-job-001");
    console.log(`test entity deleted `);
  } catch (error: any) {
    console.log(" table storage test failed ", error.message);
  }
}

async function run() {
  console.log("starting azure storage connection test");
  await testBlobStorage();
  await testTableStorage();
  console.log("\n ---All tests complete!---");
}

run();
