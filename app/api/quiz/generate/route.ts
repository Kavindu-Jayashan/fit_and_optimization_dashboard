import { NextRequest, NextResponse } from "next/server";
import { createJobService } from "../../../../lib/services/jobService";
import { createJobRepo } from "../../../../lib/repositories/jobRepository";
import { createOpenAIGenerationService } from "../../../../lib/services/openAIGenerationService";
import { createQuizService } from "../../../../lib/services/quizService";
import { createQuizGenerationService } from "../../../../lib/services/quizGenerationService";
import { createQuizRepo } from "../../../../lib/repositories/quizRepo";

export async function POST(req: NextRequest) {
  try {
    const { jobId, topic, questionCount } = await req.json();
    if (!questionCount || questionCount < 1 || questionCount > 30) {
      return NextResponse.json(
        { error: "Question count must be between 1 and 30" },
        { status: 400 },
      );
    }

    if (!jobId && !topic) {
      return NextResponse.json(
        { error: "Job or a Topic is required" },
        { status: 400 },
      );
    }

    let jobTitle: string | undefined;
    let jobDescription: string | undefined;

    if (jobId) {
      const jobService = createJobService(
        createJobRepo(),
        createOpenAIGenerationService(),
      );

      const job = await jobService.getJobById(jobId);
      jobTitle = job?.title;
      jobDescription = job?.description;
    }

    const quizService = createQuizService(
      createQuizRepo(),
      createQuizGenerationService(),
    );

    const result = await quizService.generateQuiz({
      jobId,
      topic,
      questionCount,
      jobTitle,
      jobDescription,
    });

    return NextResponse.json({ success: true, quizId: result.quizId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Quiz generation failed." },
      { status: 500 },
    );
  }
}
