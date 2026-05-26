import { NextRequest, NextResponse } from "next/server";
import { createQuizService } from "../../../../lib/services/quizService";
import { createQuizRepo } from "../../../../lib/repositories/quizRepo";
import { createQuizGenerationService } from "../../../../lib/services/quizGenerationService";

export async function POST(req: NextRequest) {
  try {
    const { jobId, topic, questions , groupLabel } = await req.json();

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one question." },
        { status: 400 },
      );
    }

    const service = createQuizService(
      createQuizRepo(),
      createQuizGenerationService(),
    );

    const quizId = await service.createFromPool(jobId, topic, groupLabel ??  topic,questions);
    return NextResponse.json({ success: true, quizId });
  } catch {}
}
