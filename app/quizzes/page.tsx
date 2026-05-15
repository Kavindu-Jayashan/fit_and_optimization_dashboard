"use client";

import { useEffect, useState } from "react";
import { QuizRecord } from "../../lib/types/quiz";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { SiteHeader } from "../../components/site-header";
import { useRouter } from "next/navigation";

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("/api/quizzes");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setQuizzes(data.quizzes ?? []);
        console.log("Quizzes API response : ", JSON.stringify(data, null, 2));
      } catch {
        setErr("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  //   convert the time into human readable form
  function formatDate(iso: string): string {
    if (!iso) return "unknown date";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  }

  // return each question type count separately
  // need to update the prompt to get short answer questions
  function parseQuestionCount(allQuestionsJson: string) {
    try {
      const questions = JSON.parse(allQuestionsJson || "[]");
      return {
        mcq: questions.filter((q: any) => q.type === "mcq").length,
        truefalse: questions.filter((q: any) => q.type === "truefalse").length,
        shortanswer: questions.filter((q: any) => q.type === "shortanswer")
          .length,
        total: questions.length,
      };
    } catch {
      return { mcq: 0, truefalse: 0, shortanswer: 0, total: 0 };
    }
  }

  //   displays the basic quiz info with the ability to expand or collapse
  //   can be took out as a separate component
  function QuizCard({ quiz }: { quiz: QuizRecord }) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const count = parseQuestionCount(quiz.allQuestionsJson);

    const selectedCount = (() => {
      try {
        return JSON.parse(quiz.selectedQuestionsJson || "[]");
      } catch {
        return 0;
      }
    })();

    function handleExpand() {
      setIsExpanded(!isExpanded);
    }

    return (
      <div className="w-ful border hover:border-[#4a7c59] rounded-2xl p-4 mt-4 ">
        {/* card header  */}
        <div className="flex items-start gap-4">
          <div>
            {/* topic + title */}
            <div className="font-medium">
              {quiz.jobId ? <span> Job-based</span> : <span>Topic-based</span>}
            </div>
            {selectedCount > 0 && <span>{selectedCount} selected</span>}
          </div>
          <h2>{quiz.topic}</h2>
          <p>{formatDate(quiz.createdAt)}</p>
        </div>

        {/* Question Count summary */}
        <div>
          <div className="flex items-start gap-4">
            <div className="flex items-start gap-2">
              <p>{count.total}</p>
              <p>Questions</p>
            </div>
            <div className="flex items-start gap-2">
              <p>{count.mcq}</p>
              <p>MCQ</p>
            </div>
            <div className="flex items-start gap-2">
              <p>{count.truefalse}</p>
              <p>T/F</p>
            </div>
          </div>
        </div>
        {/* expanded view */}
        {isExpanded && (
          <div>
            {JSON.parse(quiz.allQuestionsJson || "[]").map(
              (q: any, i: number) => (
                <div key={q.id}>
                  <span>Q{i + 1}</span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                      q.type === "mcq"
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-purple-50 text-purple-600 border-purple-100"
                    }`}
                  >
                    {q.type === "mcq" ? "MCQ" : "T/F"}
                  </span>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {q.question}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
        <svg
          className={`w-8 h-8 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          onClick={handleExpand}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        <div>
          <div className="flex items-start justify-between mt-4 ">
            <button
              className="border bg-[#4a7c59]/40 text-md rounded-2xl w-full "
              onClick={() =>
                router.push(`/jobs/[jobId]/quiz?quizId=${quiz.rowKey}`)
              }
            >
              View & Edit Selection
            </button>
            {quiz.jobId && (
              <button
                className="border bg-[#4a7c59]/40 text-md rounded-2xl w-full "
                onClick={() => router.push(`/jobs/${quiz.jobId}`)}
              >
                View Job
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "---sidebar-width": "calc(val(---spacing) * 72)",
          "---header-height": "calc(val(---spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div>
          <div>
            <div>
              <h1>Quiz Library</h1>
              <p>All generated Quizzes. Click a card to check it out.</p>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-600 rounded w-1/4 mb-3" />
                  <div className="h-5 bg-gray-500 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-600 rounded w-1/5" />
                </div>
              ))}
            </div>
          )}

          {err && <p>{err}</p>}

          {/* Empty state */}
          {!loading && !err && quizzes.length === 0 && (
            <div>
              <p>No quizzes generated yet.</p>
              <a href={`/jobs`}>Back to Jobs</a>
            </div>
          )}

          {!loading && !err && quizzes.length > 0 && (
            <div className="grid grid-cols-1  gap-6  ">
              {quizzes.map((quiz) => (
                <QuizCard key={quiz.rowKey} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
