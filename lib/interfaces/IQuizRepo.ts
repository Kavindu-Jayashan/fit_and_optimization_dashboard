import { QuizQuestion, QuizRecord } from "../types/quiz";

export interface IQuizRepo {
  save(
    quizId: string,
    jobId: string,
    topic: string,
    questions: QuizQuestion[],
    groupLabel?: string,
  ): Promise<void>;
  findById(quizId: string): Promise<QuizRecord | null>;
  findAll(): Promise<QuizRecord[]>;
  findByJobId(jobId: string): Promise<QuizRecord[]>;
  saveSelection(quizId: string, selected: QuizQuestion[]): Promise<void>;
  updateAllQuestions(
    quizId: string,
    all: QuizQuestion[],
    selected: QuizQuestion[],
  ): Promise<void>;
}
