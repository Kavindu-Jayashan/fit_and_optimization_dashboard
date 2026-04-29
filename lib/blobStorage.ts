import { BlobServiceClient } from "@azure/storage-blob";

const client = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
);

const containerClient = client.getContainerClient(
  process.env.AZURE_BLOB_CONTAINER_NAME!,
);

export async function uploadCV(
  fileBuffer: Buffer,
  fileName: string,
): Promise<{ url: string; blobName: string }> {
  const blobName = `${Date.now()}-${fileName}`;
  const blockBlob = containerClient.getBlockBlobClient(blobName);

  await blockBlob.upload(fileBuffer, fileBuffer.length, {
    blobHTTPHeaders: {
      blobContentType: fileName.endsWith(".pdf")
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  });
  return { url: blockBlob.url, blobName };
}
