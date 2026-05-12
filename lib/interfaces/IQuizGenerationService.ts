import { GenerateQuizInput, QuizQuestion } from "../types/quiz";

export interface IQuizGenerationService{
    generate(Input:GenerateQuizInput): Promise<QuizQuestion[]>
}