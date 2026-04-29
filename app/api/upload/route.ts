import { NextResponse } from "next/server";
import { extractTextFromFile } from "../../../lib/extractText";
import { uploadCV } from "../../../lib/blobStorage";


export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No file uploaded or file is empty." },
        { status: 400 },
      );
    }

    const fileName = file.name;
    const isValidType = fileName.endsWith("pdf") || fileName.endsWith(".docx");

    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or DOCX file." },
        { status: 400 },
      );
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the limit of 5MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const extractedText = await extractTextFromFile(buffer, fileName);

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract readable text from the file. Please ensure the file contains valid content.",
        },
        { status: 422 },
      );
    }

    const { url, blobName } = await uploadCV(buffer, fileName);

    return NextResponse.json({
      success: true,
      blobName,
      url,
      extractedText,
      CharacterCount: extractedText.length,
    });
  } catch (error: any) {
    console.error("upload error: ", error);

    if (error.code === "REQUEST_SEND_ERROR" || error.code === "ECONNRESET") {
      return NextResponse.json(
        { error: "Storage service timed out. please try again." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "something went wrong during upload." },
      { status: 500 },
    );
  }
}
