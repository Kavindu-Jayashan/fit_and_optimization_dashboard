import { QuizQuestion, QuizRecord } from "../types/quiz";

export interface IQuizRepo {
  save(
    quizId: string,
    jobId: string,
    topic: string,
    questions: QuizQuestion[],
  ): Promise<void>;
  findById(quizId: string): Promise<QuizRecord | null>;
  saveSelection(quizId: string, selected: QuizQuestion[]): Promise<void>;
}
