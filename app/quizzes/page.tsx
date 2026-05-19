"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { QuizQuestion } from "@/lib/types/quiz";
import { QuizRecord } from "@/lib/types/quiz";
import { QuizExportButton } from "../../components/quiz-export-button";

type SeniorityGroup = {
  seniority: string;
  industry: string;
  jobId: string;
  quizzes: QuizRecord[];
};

type GroupedQuizzes = Record<string, SeniorityGroup[]>;

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function parseQuestions(json: string): QuizQuestion[] {
  try {
    return JSON.parse(json || "[]");
  } catch {
    return [];
  }
}

export default function QuizzesPage() {
  const router = useRouter();
  const [grouped, setGrouped] = useState<GroupedQuizzes>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pool state — tracks questions selected across all quizzes
  // for building a custom combined quiz.
  // Uses a Map<questionId, QuizQuestion> to avoid duplicates

  const [pool, setPool] = useState<Map<string, QuizQuestion>>(new Map());
  const [poolJobId, setPoolJobId] = useState("");
  const [poolTopic, setPoolTopic] = useState("Custom Pool Quiz");
  const [savingPool, setSavingPool] = useState(false);
  const [poolSuccess, setPoolSuccess] = useState("");

  // Expanded state tracks which job title groups and seniority
  // groups are open. Stored as Sets of string keys for O(1) toggle.

  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const res = await fetch("/api/quizzes");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setGrouped(data.grouped ?? {});
      } catch (err: any) {
        setError(err.message || "Failed to load quizzes.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuizzes();
  }, []);

  function toggleJob(title: string) {
    setExpandedJobs((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  }

  function toggleQuiz(quizId: string) {
    setExpandedQuizzes((prev) => {
      const next = new Set(prev);
      next.has(quizId) ? next.delete(quizId) : next.add(quizId);
      return next;
    });
  }

  // Toggles a question in/out of the pool.
  // When adding the first question from a job, sets that job
  // as the pool's associated job for library organization.

  function togglePoolQuestion(q: QuizQuestion, jobId: string) {
    setPool((prev) => {
      const next = new Map(prev);
      if (next.has(q.id)) {
        next.delete(q.id);
      } else {
        next.set(q.id, q);
        if (next.size === 1) setPoolJobId(jobId);
      }
      return next;
    });
  }

  // Saves the pool as a new combined quiz.
  // The new quiz is saved with all selected questions as both
  // allQuestionsJson and selectedQuestionsJson since the
  // recruiter has already made their selection.

  async function handleSavePool() {
    if (pool.size === 0) return;
    setSavingPool(true);
    try {
      const res = await fetch("/api/quiz/pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: poolJobId,
          topic: poolTopic,
          groupLabel: poolTopic,
          questions: Array.from(pool.values()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPoolSuccess("Quiz saved! Redirecting...");
      setPool(new Map());
      setTimeout(() => router.push("/quizzes"), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save pool quiz.");
    } finally {
      setSavingPool(false);
    }
  }

  const jobTitles = Object.keys(grouped).sort();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-gray-900 font-serif font-normal mb-1">
                Quiz Library
              </h1>
              <p className="text-sm text-gray-500">
                Browse quizzes by job and seniority. Select questions to build a
                custom quiz.
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Empty */}
          {!loading && !error && jobTitles.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm mb-4">No quizzes yet.</p>
              <a
                href="/jobs"
                className="bg-[#4a7c59] text-white px-5 py-2.5 rounded-xl text-sm font-medium"
              >
                Go to Job Listings
              </a>
            </div>
          )}

          <div className="flex gap-6 items-start">
            {/* ── Left — Grouped Quiz Library ── */}
            <div className="flex-1 flex flex-col gap-4">
              {jobTitles.map((jobTitle) => (
                <div
                  key={jobTitle}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Job title header — click to expand */}
                  <div
                    onClick={() => toggleJob(jobTitle)}
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <h2 className="text-base font-medium text-gray-800">
                      {jobTitle}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {grouped[jobTitle].reduce(
                          (acc, g) => acc + g.quizzes.length,
                          0,
                        )}{" "}
                        quiz
                        {grouped[jobTitle].reduce(
                          (acc, g) => acc + g.quizzes.length,
                          0,
                        ) !== 1
                          ? "zes"
                          : ""}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expandedJobs.has(jobTitle) ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>

                  {/* Seniority groups */}
                  {expandedJobs.has(jobTitle) && (
                    <div className="border-t border-gray-100">
                      {grouped[jobTitle].map((group) => (
                        <div
                          key={group.seniority}
                          className="border-b border-gray-50 last:border-0"
                        >
                          {/* Seniority label */}
                          {group.seniority && (
                            <div className="px-6 py-2 bg-gray-50/50 flex items-center gap-2">
                              <span className="text-xs text-[#4a7c59] bg-[#4a7c59]/10 border border-[#4a7c59]/20 px-2.5 py-1 rounded-full font-medium">
                                {group.seniority}
                              </span>
                              {group.industry && (
                                <span className="text-xs text-gray-400">
                                  {group.industry}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Quizzes within seniority group */}
                          {group.quizzes.map((quiz) => {
                            const questions = parseQuestions(
                              quiz.allQuestionsJson,
                            );
                            const isOpen = expandedQuizzes.has(quiz.rowKey);

                            return (
                              <div
                                key={quiz.rowKey}
                                className="border-t border-gray-50"
                              >
                                {/* Quiz row header */}
                                <div
                                  onClick={() => toggleQuiz(quiz.rowKey)}
                                  className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-700 font-medium">
                                      {quiz.topic}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      {questions.length} questions
                                    </span>
                                    <span className="text-xs text-gray-300">
                                      {formatDate(quiz.createdAt)}
                                    </span>
                                  </div>
                                  <svg
                                    className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M6 9l6 6 6-6" />
                                  </svg>
                                  <div className="flex items-center gap-2">
                                    {/**
                                      Add all questions from this quiz to the pool in one click.
                                      Stops click propagation so it doesn't also toggle the quiz open.
                                      This is the "merge quiz" functionality — adds every question
                                      from this quiz to the pool builder panel on the right.
                                     */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const questions = parseQuestions(
                                          quiz.allQuestionsJson,
                                        );
                                        questions.forEach((q) => {
                                          setPool((prev) => {
                                            const next = new Map(prev);
                                            if (!next.has(q.id)) {
                                              next.set(q.id, q);
                                              if (next.size === 1)
                                                setPoolJobId(quiz.jobId);
                                            }
                                            return next;
                                          });
                                        });
                                      }}
                                      className="text-xs text-gray-400 hover:text-[#4a7c59] border border-gray-200 hover:border-[#4a7c59] px-2.5 py-1 rounded-lg transition-all"
                                    >
                                      + Add all
                                    </button>

                                    <svg
                                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                    >
                                      <path d="M6 9l6 6 6-6" />
                                    </svg>
                                    <QuizExportButton
                                      topic={quiz.topic}
                                      questions={parseQuestions(
                                        quiz.allQuestionsJson,
                                      )}
                                      variant="outline"
                                    />
                                  </div>
                                </div>

                                {/* Question list — selectable for pool */}
                                {isOpen && (
                                  <div className="px-6 pb-4 flex flex-col gap-1.5">
                                    {questions.map((q, index) => {
                                      const inPool = pool.has(q.id);
                                      return (
                                        <div
                                          key={q.id}
                                          onClick={() =>
                                            togglePoolQuestion(q, quiz.jobId)
                                          }
                                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                            inPool
                                              ? "border-[#4a7c59] bg-[#4a7c59]/5"
                                              : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                                          }`}
                                        >
                                          {/* Checkbox */}
                                          <div
                                            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                              inPool
                                                ? "bg-[#4a7c59] border-[#4a7c59]"
                                                : "border-gray-300"
                                            }`}
                                          >
                                            {inPool && (
                                              <svg
                                                className="w-2.5 h-2.5 text-white"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                              >
                                                <path d="M20 6L9 17l-5-5" />
                                              </svg>
                                            )}
                                          </div>

                                          <div className="flex-1 flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs text-gray-400">
                                                Q{index + 1}
                                              </span>
                                              <span
                                                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                                  q.type === "mcq"
                                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                                    : "bg-purple-50 text-purple-600 border-purple-100"
                                                }`}
                                              >
                                                {q.type === "mcq"
                                                  ? "MCQ"
                                                  : "T/F"}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-700 line-clamp-2">
                                              {q.question}
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Right — Pool Builder ── */}
            <div className="w-80 shrink-0 sticky top-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">
                    Custom Quiz Builder
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Click any question from any quiz to add it to your custom
                    pool.
                  </p>
                </div>

                {/* Stats */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                    <p className="text-xl font-semibold text-[#4a7c59]">
                      {pool.size}
                    </p>
                    <p className="text-xs text-gray-400">Selected</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                    <p className="text-xl font-semibold text-blue-600">
                      {
                        Array.from(pool.values()).filter(
                          (q) => q.type === "mcq",
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-400">MCQ</p>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                    <p className="text-xl font-semibold text-purple-600">
                      {
                        Array.from(pool.values()).filter(
                          (q) => q.type === "truefalse",
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-400">T/F</p>
                  </div>
                </div>

                {/* Selected questions list */}
                {pool.size > 0 && (
                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                    {Array.from(pool.values()).map((q, i) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-2 text-xs text-gray-600 py-1.5 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-gray-300 shrink-0">{i + 1}.</span>
                        <p className="line-clamp-2">{q.question}</p>
                        <button
                          onClick={() => togglePoolQuestion(q, "")}
                          className="text-gray-300 hover:text-red-400 shrink-0 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quiz name input */}
                {pool.size > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                      Quiz Name
                    </label>
                    <input
                      type="text"
                      value={poolTopic}
                      onChange={(e) => setPoolTopic(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all"
                    />
                  </div>
                )}

                {/* Success message */}
                {poolSuccess && (
                  <p className="text-xs text-[#4a7c59] bg-[#4a7c59]/10 border border-[#4a7c59]/20 rounded-xl px-3 py-2">
                    {poolSuccess}
                  </p>
                )}

                {/* Save button */}
                <button
                  onClick={handleSavePool}
                  disabled={pool.size === 0 || savingPool}
                  className="w-full bg-[#4a7c59] hover:bg-[#5a9c6e] disabled:opacity-40 text-white rounded-xl py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
                >
                  {savingPool
                    ? "Saving..."
                    : pool.size === 0
                      ? "Select questions to build"
                      : `Save Quiz — ${pool.size} question${pool.size !== 1 ? "s" : ""}`}
                </button>

                {pool.size > 0 && (
                  <button
                    onClick={() => setPool(new Map())}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors text-center"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
