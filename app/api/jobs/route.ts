import { NextResponse } from "next/server";
import { createJobService } from "../../../services/jobService";
import { createJobRepo } from "../../../repositories/jobRepository";
import { createOpenAIGenerationService } from "../../../services/openAIGenerationService";

export async function GET() {
  try {
    const service = createJobService(
      createJobRepo(),
      createOpenAIGenerationService(),
    );
    const jobs = await service.getAllJobs();
    return NextResponse.json({ jobs });
  } catch (err: any) {
    console.error("GET /api/jobs error: ", err);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
