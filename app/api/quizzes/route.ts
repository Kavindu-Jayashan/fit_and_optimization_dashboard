import { NextResponse } from "next/server";
import { createQuizRepo } from "../../../lib/repositories/quizRepo";
import { createQuizGenerationService } from "../../../lib/services/quizGenerationService";
import { createQuizService } from "../../../lib/services/quizService";
import { createJobService } from "../../../lib/services/jobService";
import { createJobRepo } from "../../../lib/repositories/jobRepository";
import { createOpenAIGenerationService } from "../../../lib/services/openAIGenerationService";

export async function GET() {
  try {
    const service = createQuizService(
      createQuizRepo(),
      createQuizGenerationService(),
    );

    const jobService = createJobService(
      createJobRepo(),
      createOpenAIGenerationService(),
    );

    const [quizzes, jobs] = await Promise.all([
      service.getAllQuizzes(),
      jobService.getAllJobs(),
    ]);

    const jobMap = new Map(jobs.map((job) => [job.rowKey, job]));

    // grouping quizzes by job title then seniority level
    const grouped: Record<
      string,
      {
        seniority: string;
        industry: string;
        jobId: string;
        quizzes: typeof quizzes;
      }[]
    > = {};

    for (const quiz of quizzes) {
      const job = jobMap.get(quiz.jobId);
      const jobTitle = ((job?.title ?? quiz.groupLabel) || "unassigned").trim();
      const seniority = job?.seniority || "";
      const industry = job?.industry || "";
      const jobId = quiz.jobId ?? "";

      if (!grouped[jobTitle]) {
        grouped[jobTitle] = [];
      }

      let seniorityGroup = grouped[jobTitle].find(
        (group) => group.seniority === seniority,
      );

      if (!seniorityGroup) {
        seniorityGroup = { seniority, industry, jobId, quizzes: [] };
        grouped[jobTitle].push(seniorityGroup);
      }
      seniorityGroup.quizzes.push(quiz);
    }

    const seniorityOrder = [
      "Intern",
      "Junior",
      "Mid-Level",
      "Senior",
      "Lead",
      "Manager",
    ];

    for (const title of Object.keys(grouped)) {
      grouped[title].sort(
        (a, b) =>
          seniorityOrder.indexOf(a.seniority) -
          seniorityOrder.indexOf(b.seniority),
      );
    }

    //This must be returned as {quizzes} because if not this will return a plain array []
    return NextResponse.json({ grouped });
  } catch (err: any) {
    console.error("GET api/quizzes error: ", err);
    return NextResponse.json(
      { error: err.message || "Failed to get quizzes" },
      { status: 500 },
    );
  }
}
