import { TableClient } from "@azure/data-tables";
import { IQuizRepo } from "../interfaces/IQuizRepo";
import { QuizQuestion, QuizRecord } from "../types/quiz";

export function createQuizRepo(): IQuizRepo {
  const tableClient = TableClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING!,
    "Quizzes",
  );

  //   save newly generated questions
  // selectedQuestionsJson starts empty - populated after recruiter selects
  async function save(
    quizId: string,
    jobId: string,
    topic: string,
    questions: QuizQuestion[],
  ): Promise<void> {
    await tableClient.upsertEntity({
      partitionKey: "quizzes",
      rowKey: quizId,
      jobId: String(jobId),
      topic: String(topic),
      allQuestionsJson: JSON.stringify(questions),
      selectedQuestions: "[]",
      questionCount: questions.length,
      createdAt: new Date().toISOString(),
    });
  }

  //   find a quiz by id for the selection page
  async function findById(quizId: string): Promise<QuizRecord | null> {
    try {
      const entity = await tableClient.getEntity("quizzes", quizId);
      return {
        rowKey: String(entity.rowKey),
        jobId: String(entity.jobId ?? ""),
        topic: String(entity.topic ?? ""),
        allQuestionsJson: String(entity.allQuestionsJson ?? ""),
        selectedQuestionsJson: String(entity.selectedQuestionsJson ?? ""),
        questionCount: Number(entity.questionCount ?? 0),
        createdAt: String(entity.createdAt ?? ""),
      };
    } catch {
      return null;
    }
  }

  //   save the recruiters selection to Azure
  // used when recruiter finalize their selection
  async function saveSelection(
    quizId: string,
    selected: QuizQuestion[],
  ): Promise<void> {
    await tableClient.upsertEntity({
      partitionKey: "quizzes",
      rowKey: quizId,
      selectedQuestionsJson: JSON.stringify(selected),
    });
  }

  return { save, findById, saveSelection };
}
