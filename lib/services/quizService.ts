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
    await quizRepo.save(
      quizId,
      input.jobId ?? "",
      topic,
      questions,
      input.groupLabel ?? "",
    );
    return { quizId, questions };
  }

  async function getQuiz(quizId: string): Promise<QuizRecord> {
    const quiz = await quizRepo.findById(quizId);
    if (!quiz) throw new Error(`Quiz ${quizId} not  found`);
    return quiz;
  }

  async function getAllQuizzes(): Promise<QuizRecord[]> {
    return quizRepo.findAll();
  }

  async function getQuizById(quizId: string): Promise<QuizRecord[]> {
    return quizRepo.findByJobId(quizId);
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

  async function createFromPool(
    jobId: string,
    topic: string,
    groupLabel: string,
    questions: QuizQuestion[],
  ): Promise<string> {
    const quizId = `quiz-${Date.now()}`;
    await quizRepo.save(quizId, jobId, topic, questions, groupLabel);
    await quizRepo.saveSelection(quizId, questions);
    return quizId;
  }

  async function updateAllQuestions(
    quizId: string,
    all: QuizQuestion[],
    selected: QuizQuestion[],
  ): Promise<void> {
    await quizRepo.updateAllQuestions(quizId, all, selected);
  }

  return {
    generateQuiz,
    getQuiz,
    getAllQuizzes,
    createFromPool,
    getQuizById,
    updateAllQuestions,
    saveSelection,
  };
}
