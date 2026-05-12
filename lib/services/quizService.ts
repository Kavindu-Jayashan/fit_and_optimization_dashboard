import { IQuizRepo } from "../interfaces/IQuizRepo";
import { IQuizGenerationService } from "../interfaces/IQuizGenerationService";
import { GenerateQuizInput, QuizQuestion, QuizRecord } from "../types/quiz";

export function createQuizService(
  quizRepo: IQuizRepo,
  generationService: IQuizGenerationService,
) {
  async function generateQuiz(
    input: GenerateQuizInput,
  ): Promise<{ quizId: string; questions: QuizQuestion[] }> {
    const questions = await generationService.generate(input);
    const quizId = `quiz-${Date.now()}`;
    const topic = input.topic ?? input.jobTitle ?? "General";
    await quizRepo.save(quizId, input.jobId ?? "", topic, questions);
    return { quizId, questions };
  }

  async function getQuiz(quizId: string): Promise<QuizRecord> {
    const quiz = await quizRepo.findById(quizId);
    if (!quiz) throw new Error(`Quiz ${quizId} not  found`);
    return quiz;
  }

  async function saveSelection(
    quizId: string,
    selected: QuizQuestion[],
  ): Promise<void> {
    if (selected.length === 0) {
      throw new Error("No questions selected");
    }
    await quizRepo.saveSelection(quizId, selected);
  }

  return { generateQuiz, getQuiz, saveSelection };
}
