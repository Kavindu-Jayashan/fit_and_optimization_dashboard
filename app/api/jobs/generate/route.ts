import { NextRequest, NextResponse } from "next/server";
import { createJobService } from "../../../../lib/services/jobService";
import { createJobRepo } from "../../../../lib/repositories/jobRepository";
import { createOpenAIGenerationService } from "../../../../lib/services/openAIGenerationService";

// accept recruiter input and triggers the JD generation
export async function POST(req: NextRequest) {
  try {
    const { title, seniority, industry, responsibilities } = await req.json();
    if (!title || !seniority || !industry || !responsibilities) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }
    const service = createJobService(
      createJobRepo(),
      createOpenAIGenerationService(),
    );

    const result = await service.CreateJob({
      title,
      seniority,
      industry,
      responsibilities,
    });

    return NextResponse.json({ success: true, jobId: result.jobId });
  } catch (err: any) {
    console.error("POST /api/jobs/generate error: ", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate Job Description." },
      { status: 500 },
    );
  }
}
