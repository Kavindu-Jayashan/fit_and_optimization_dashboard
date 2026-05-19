import { QuizQuestion } from "../types/quiz";

export interface IQuizExport{
    topic : string;
    questions: QuizQuestion[];
    variant?: "outline" | "solid"
}