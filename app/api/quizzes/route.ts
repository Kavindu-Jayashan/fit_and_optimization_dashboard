import { NextResponse } from "next/server";
import { createQuizRepo } from "../../../lib/repositories/quizRepo";
import { createQuizGenerationService } from "../../../lib/services/quizGenerationService";
import { createQuizService } from "../../../lib/services/quizService";

export async function GET() {
  try {
    const service = createQuizService(
      createQuizRepo(),
      createQuizGenerationService(),
    );

    const quizzes = await service.getAllQuizzes();

    //This must be returned as {quizzes} because if not this will return a plain array []
    return NextResponse.json({ quizzes });
  } catch (err: any) {
    console.error("GET api/quizzes error: ", err);
    return NextResponse.json(
      { error: err.message || "Failed to get quizzes" },
      { status: 500 },
    );
  }
}
