import { NextRequest, NextResponse } from "next/server";
import { createQuizService } from "../../../../lib/services/quizService";
import { createQuizRepo } from "../../../../lib/repositories/quizRepo";
import { createQuizGenerationService } from "../../../../lib/services/quizGenerationService";

export async function GET(
  _req: NextRequest,
  { params }: { params: { quizId: string } },
) {
  try {
    const service = createQuizService(
      createQuizRepo(),
      createQuizGenerationService(),
    );

    const quiz = await service.getQuiz(params.quizId);
    return NextResponse.json({ quiz });
  } catch (err: any) {
    console.error("GET /api/quiz/[quizId] error: ", err);
    return NextResponse.json(
      { error: err.message || " Quiz not found" },
      { status: 404 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { quizId: string } },
) {
  try {
    const { selected } = await req.json();
    const service = createQuizService(
      createQuizRepo(),
      createQuizGenerationService(),
    );

    await service.saveSelection(params.quizId, selected);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PUT api/quiz/[quizId] error :", err);
    return NextResponse.json(
      { error: err.message || "Failed to save selection." },
      { status: 500 },
    );
  }
}
