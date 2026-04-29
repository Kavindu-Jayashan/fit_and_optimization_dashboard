import { extractText } from "unpdf";
import mammoth from "mammoth";


export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
): Promise<string> {
  const isPDF = fileName.toLowerCase().endsWith(".pdf");
  const isDOCX = fileName.toLowerCase().endsWith(".docx");

  if (isPDF) {
    const uint8Array = new Uint8Array(buffer);
    const {text} = await extractText(uint8Array, {mergePages: true})
    return text.trim();
  }

  if (isDOCX) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}
