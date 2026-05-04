import { generateJobDescription } from "./../../../../lib/openai";
import { NextRequest, NextResponse } from "next/server";
import { TableClient } from "@azure/data-tables";
import { createJob } from "../../../../services/jobService";

const tableClient = TableClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
  process.env.AZURE_TABLE_NAME!,
);

export async function POST(request: NextRequest) {
  try {
    const { title, seniority, industry, responsibilities } =
      await request.json();

    if (!title || !seniority || !industry || !responsibilities) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const res = await createJob(title, seniority, industry, responsibilities);

    return NextResponse.json({
      success: true,
      ...res,
    });
  } catch (error: any) {
    console.error("Generated JD error: ", error);

    if (error.status === 429) {
      return NextResponse.json(
        { error: "OpenAi rate limit reached. please try again shortly." },
        { status: 429 },
      );
    }

    if (error.code === "ECONNRESET" || error.code === "REQUEST_SEND_ERROR") {
      return NextResponse.json(
        { error: "Connection timed out. please try again." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate job Description." },
      { status: 500 },
    );
  }
}
