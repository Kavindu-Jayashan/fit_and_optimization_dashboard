"use client";
import { useParams } from "next/navigation";
import { AppSidebar } from "../../../../../components/app-sidebar";
import { SiteHeader } from "../../../../../components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "../../../../../components/ui/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Job = {
  title: string;
  seniority: string;
  industry: string;
};

export default function CreateQuizPage() {
  const params = useParams();
  const jobId = params.jobId;
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [mode, setMode] = useState<"job" | "topic">("job");
  const [topic, setTopic] = useState("");
  const [jobs, setJobs] = useState<
    { rowKey: string; title: string; seniority: string }[]
  >([]);

  const [questionCount, setQuestionCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setJob(data.job);
      } catch {
        setMode("topic");
      } finally {
        setFetching(false);
      }
    }
    if (jobId) fetchJob();
  }, [jobId]);

  useEffect(() => {
    async function fetchJobs() {
      const res = await fetch(`/api/jobs`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobs(data.jobs);
    }
    fetchJobs();
  }, []);

  async function handleGenerate() {
    setErr("");

    if (mode === "topic" && !topic.trim()) {
      setErr("Please enter a topic");
      return;
    }

    if (questionCount < 1 || questionCount > 30) {
      setErr("Question count must be between 1 and 30");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/quiz/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: mode === "job" ? jobId : selectedJob || undefined,
          topic: mode === "topic" ? topic : undefined,

          questionCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const redirectJobId = mode === "job" ? jobId : selectedJob;
      router.push(`/jobs/${redirectJobId}/quiz?quizId=${data.quizId}`);
    } catch (err: any) {
      setErr(err.message || "failed to generate quiz");
    } finally {
      setLoading(false);
    }
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
        <div className="flex flex-1 flex-col p-6 gap-6 max-w-2xl">
          {/* header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl text-gray-900 font-serif font-normal mb-1">
                Generate Screening Quiz
              </h1>
              <p className="text-sm text-gray-500">
                AI will generate a mix of MCQ , True/False and Short Answer
                questions.
              </p>
            </div>
            <a
              className="text-sm text-gray-400 hover:text-[#417c59] transition-colors shrink-0 mt-1"
              href={`/jobs/${jobId}`}
            >
              back
            </a>
          </div>
          {/* mode selection */}
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                Generate Based On
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    mode === "job"
                      ? "bg-[#4a7c59] text-white border-[#4q7c59]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#4a7c59]"
                  }`}
                  onClick={() => setMode("job")}
                >
                  {fetching
                    ? "Loading Job"
                    : job
                      ? `${job.title}`
                      : "Job Description"}
                </button>
                <button
                  className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                    mode === "topic"
                      ? "bg-[#4a7c59] text-white border-[#4q7c59]"
                      : "bg-white text-gray-500 border-gray-200 hover:border-[#4a7c59]"
                  }`}
                  onClick={() => setMode("topic")}
                >
                  Custom Topic
                </button>
              </div>
            </div>
            {/* if the user want to add custom topic for quiz generation */}
            {mode === "topic" && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Topic
                </label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Related Job
                  </label>
                  <select
                    name="selectedJob"
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all bg-white"
                  >
                    <option value="">Select Job</option>
                    {jobs
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map((job) => (
                        <option key={job.rowKey} value={job.rowKey}>
                          {job.title} - {job.seniority}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="text-xs text-gray-300">
                  This is the group this quiz will appear under in the quiz
                  library.
                </p>
              </div>
            )}
            {/* using job to generate quiz */}
            {mode === "job" && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="flex gap-2">
                  <span className="text-xs text-[#4a7c59] bg-[#4a7c59]/10 border border-[#4a7c59]/20 px-2.5 py-1 rounded-full font-medium">
                    {job?.seniority}
                  </span>
                  <span className="text-xs text-gray-400 bg-white border border-gray-100 px-2.5 py-1 rounded-full">
                    {job?.industry}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  {job?.title}
                </p>
              </div>
            )}

            {/* setting up the question count it must be between 1 and 30  */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Number of Questions
                </label>
                <span className="text-sm font-semibold text-[#4a7c59]">
                  {questionCount}
                </span>
              </div>
              <input
                className="w-full accent-[#4a7c59]"
                type="range"
                min={1}
                max={30}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-300">
                <span>1</span>
                <span>
                  ~{Math.ceil(questionCount * 0.5)} MCQ +
                  {Math.ceil(questionCount * 0.3)} Short Answer +
                  {Math.ceil(questionCount * 0.2)} True/False
                </span>
                <span>30</span>
              </div>
            </div>
            {/* Error */}
            {err && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rou-xl px-4 py-3">
                {err}
              </p>
            )}

            <button
              className="w-full bg-[#4a7c59] hover:bg-[#5a9c6e] disabled:opacity-40 text-white rounded-xl py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Questions"}
            </button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
