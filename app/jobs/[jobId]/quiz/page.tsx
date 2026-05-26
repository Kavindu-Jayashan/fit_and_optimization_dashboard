"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { QuizQuestion } from "../../../../lib/types/quiz";
import {
  SidebarInset,
  SidebarProvider,
} from "../../../../components/ui/sidebar";
import { AppSidebar } from "../../../../components/app-sidebar";
import { SiteHeader } from "../../../../components/site-header";

function QuizSelectionContent() {
  const { jobId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get("quizId");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    async function fetchQuiz() {
      if (!quizId) {
        setErr("No  quiz id provided.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/quiz/${quizId}`);
        const data = await res.json();
        console.log("allQuestionsJson raw:", data.quiz.allQuestionsJson);
        console.log(
          "selectedQuestionsJson raw:",
          data.quiz.selectedQuestionsJson,
        );
        console.log("Quiz API Response: ", JSON.stringify(data, null, 2));
        if (!res.ok) throw new Error(data.error);
        const allQuestions: QuizQuestion[] = JSON.parse(
          data.quiz.allQuestionsJson || "[]",
        );
        setQuestions(allQuestions);
        setTopic(data.quiz.topic);
        setSelected(new Set(allQuestions.map((q) => q.id)));
      } catch (err: any) {
        setErr(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  function toggleQuestion(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === questions.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(questions.map((q) => q.id)));
    }
  }

  async function handleSave() {
    if (selected.size === 0) {
      setErr("Please select at least one question");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const selectedQuestions = questions.filter((q) => selected.has(q.id));
      const res = await fetch(`/api/quiz/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected: selectedQuestions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Quiz saved successfully");

      setTimeout(() => {
        if (jobId) {
          router.push(`/jobs/${jobId}`);
        } else {
          router.push(`/quizzes`);
        }
      });
    } catch (err: any) {
      setErr(err.message || "Failed to save Quiz.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col p-6 gap-4 max-w-3xl">
            <div className="animate-pulse flex flex-col gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
              ))}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "---sidebar-width": "calc(var(---spacing) * 72 )",
          "---header-height": "calc(var(---spacing) * 12 )",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6 max-w-3xl">
          {/* header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl text-gray-900 font-serif font-normal mb-1">
                Select Quiz Questions
              </h1>
              <p className="text-sm text-gray-500">
                {topic} - {questions.length} questions generated. Select the
                ones you want to include.
              </p>
            </div>
            <a
              className="text-sm text-gray-400 hover:text-[#4a7c59] transition-colors shrink-0 mt-1"
              href={`/jobs/${jobId}`}
            >
              back
            </a>
          </div>
          {/* status bar */}
          <div className="flex items-center justify-between ng-white border border-gray-100 rounded-2xl px-6 py-4 shadow-md">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-semibold text-[#4a7c59] ">
                  {selected.size}
                </p>
                <p className="text-xs text-gray-400">Selected</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-700">
                  {
                    questions.filter(
                      (q) => q.type === "mcq" && selected.has(q.id),
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-400">MCQ</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-700">
                  {
                    questions.filter(
                      (q) => q.type === "shortanswer" && selected.has(q.id),
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-400">Short Answer</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-700">
                  {
                    questions.filter(
                      (q) => q.type === "truefalse" && selected.has(q.id),
                    ).length
                  }
                </p>
                <p className="text-xs text-gray-400">True/False</p>
              </div>
            </div>
            <button
              onClick={toggleAll}
              className="text-xs text-gray-400 hover:text-[#4a7c59] transition-colors font-medium"
            >
              {selected.size === questions.length
                ? "Deselect all"
                : "Select all"}
            </button>
          </div>
          {/* error / success */}
          {err && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {err}
            </p>
          )}
          {success && (
            <p className="text-xs text-[#4a7c59] bg-[#4a7c59]/10 border border-[#4a7c59]/20 rounded-xl px-4 py-3">
              {success}
            </p>
          )}

          {/* question list */}
          <div className="flex flex-col gap-3">
            {questions.map((q, index) => {
              const isSelected = selected.has(q.id);
              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className={`bg-white border rounded-2xl p-6 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#4a7c59] shadow-sm shadow-[#4a7c59]/10"
                      : "border-gray-100 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isSelected
                          ? "bg-[#4a7c59] border-[#4a7c59]"
                          : "border-gray-200"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium">
                          Q{index + 1}
                        </span>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                            q.type === "mcq"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : "bg-purple-50 text-purple-600 border-purple-100"
                          }`}
                        >
                          {q.type === "mcq"
                            ? "MCQ"
                            : q.type === "shortanswer"
                              ? "Short Answer"
                              : "True/False"}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 leading-relaxed">
                        {q.question}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {q.options.map((opt) => (
                          <div
                            key={opt}
                            className={`text-xs px-3 py-2 rounded-lg border ${
                              opt === q.idealAnswer
                                ? "bg-[#4a7c59]/10 border-[#4a7c59]/20 text-[#4a7c59] font-medium"
                                : "bg-gray-50 border-gray-100 text-gray-500"
                            }`}
                          >
                            {opt === q.idealAnswer && "✔️"}
                            {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed italic">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sticky bottom-6">
            <button
              className="w-full bg-[#4a7c59] hover:bg-[#5a9c6e] disabled:opacity-40 text-white rounded-xl py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
              onClick={handleSave}
              disabled={saving || selected.size === 0}
            >
              {saving
                ? "Saving..."
                : `Save Quiz with ${selected.size} question${selected.size !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function QuizSelectionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuizSelectionContent />
    </Suspense>
  );
}
