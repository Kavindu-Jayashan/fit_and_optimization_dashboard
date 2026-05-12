import { NextRequest, NextResponse } from "next/server";
import { createJobService } from "../../../../lib/services/jobService";
import { createJobRepo } from "../../../../lib/repositories/jobRepository";
import { createOpenAIGenerationService } from "../../../../lib/services/openAIGenerationService";
import { success } from "zod";

export async function GET(
  req: Request,
  { params }: { params: Promise< {jobId: string }> },
) {
  try {
    const service = createJobService(
      createJobRepo(),
      createOpenAIGenerationService(),
    );

    const {jobId} = await params;

    const job = await service.getJobById(jobId);
    return NextResponse.json({ job });
  } catch (err: any) {
    console.error("GET  /api/jobs/[jobId] error: ", err);
    return NextResponse.json(
      {
        error: "Job not found",
      },
      { status: 404 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const updates = await req.json();
    const service = createJobService(
      createJobRepo(),
      createOpenAIGenerationService(),
    );
    const{jobId} = await params;
    await service.updateJob(jobId, updates);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT api/jobs/[jobId] error: ", err);
    return NextResponse.json(
      { error: err.message || "Failed to update job" },
      { status: 500 },
    );
  }
}
