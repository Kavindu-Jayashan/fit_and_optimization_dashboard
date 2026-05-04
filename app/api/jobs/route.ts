import { NextResponse } from "next/server";
import { TableClient } from "@azure/data-tables";
import { getJobs } from "../../../services/jobService";

const tableClient = TableClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!,
  process.env.AZURE_TABLE_NAME!,
);

export async function GET() {
  try {
    const jobs = await getJobs();

    return NextResponse.json({ jobs });
  } catch (err) {
    console.error("error in fetching jobs: ", err);
    return NextResponse.json(
      { error: "failed to fetch jobs" },
      { status: 500 },
    );
  }
}
