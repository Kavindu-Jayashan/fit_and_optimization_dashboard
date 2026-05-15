"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "../../../components/ui/sidebar";
import { AppSidebar } from "../../../components/app-sidebar";
import { SiteHeader } from "../../../components/site-header";
import { ATSKeywords, JobRecord } from "../../../lib/types/job";

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<JobRecord | null>(null);
  const [keywords, setKeywords] = useState<ATSKeywords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch("/api/jobs");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }
        const found = data.jobs.find((job: JobRecord) => job.rowKey === jobId);
        if (!found) throw new Error("Job Not Found.");

        setJob(found);
        setKeywords(JSON.parse(found.atsKeywordsJson));
      } catch (error: any) {
        setError(error.message || "Failed to load Job.");
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId]);

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 3000);
  }

  function KeywordSection({
    title,
    keywords,
    color,
    copyKey,
  }: {
    title: string;
    keywords: string[];
    color: string;
    copyKey: string;
  }) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <button
            onClick={() => copyToClipboard(keywords.join(", "), copyKey)}
            className="text-xs text-gray-400 hover:text-[#4a7c59] transition-colors"
          >
            {copied === copyKey ? "Copied!" : "Copy all"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <span
              key={kw}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${color}`}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
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
          <div className="flex flex-1 flex-col p-6 gap-4 max-w-4xl">
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-8 bg-gray-400 rounded-xl w-1/3" />
              <div className="h-4 bg-gray-500 rounded w-1/4" />
              <div className="h-64 bg-gray-400 rounded-2xl" />
              <div className="h-32 bg-gray-500 rounded-2xl" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error) {
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
          <div className="flex flex-1 flex-col p-6">
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
        <div className="flex flex-1 flex-col p-6 gap-6 max-w-4xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[#4a7c59] bg-[#4a7c59]/10 border border-[#4a7c59]/20 px-2.5 py-1 rounded-full font-medium">
                  {job?.seniority}
                </span>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                  {job?.industry}
                </span>
              </div>
              <h1 className="text-2xl text-gray-900 font-serif font-normal mt-2">
                {job?.title}
              </h1>
            </div>
            <a
              href={`/jobs/${jobId}/quiz/create`}
              className="border border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
            >
              Create Quiz
            </a>
            <a
              href={`/jobs/${jobId}/edit`}
              className="bg-[#4a7c59] hover:bg-[#5a9c6e] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
            >
              Edit JD
            </a>
            <a
              href="/jobs/new"
              className="text-sm text-gray-400 hover:text-[#4a7c59] transition-colors shrink-0 mt-1"
            >
              Generate Another
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left side — Job Description */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gray-700">
                    Generate Job Description
                  </h2>
                  <button
                    onClick={() =>
                      copyToClipboard(job?.description ?? "", "jd")
                    }
                    className="text-xs text-gray-400 hover:text-[#4a7c59] transition-colors"
                  >
                    {copied === "jd" ? "Copied!" : "Copy JD"}
                  </button>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {typeof job?.description === "object"
                    ? JSON.stringify(job?.description)
                    : job?.description}
                </div>
              </div>
            </div>
            {/* Right side — ATS Keywords */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-1">
                  ATS Keywords
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Use these keywords in your ATS filtering rules to screen
                  candidates effectively.
                </p>
              </div>

              {keywords && (
                <>
                  <KeywordSection
                    title="Hard Skills"
                    keywords={keywords.hardSkills}
                    color="bg-blue-50 text-blue-600 border-blue-100"
                    copyKey="hard"
                  />
                  <KeywordSection
                    title="Soft Skills"
                    keywords={keywords.softSkills}
                    color="bg-purple-50 text-purple-600 border-purple-100"
                    copyKey="soft"
                  />
                  <KeywordSection
                    title="Qualifications"
                    keywords={keywords.qualifications}
                    color="bg-amber-50 text-amber-600 border-amber-100"
                    copyKey="qual"
                  />
                  <KeywordSection
                    title="Experience"
                    keywords={keywords.experience}
                    color="bg-[#4a7c59]/10 text-[#4a7c59] border-[#4a7c59]/20"
                    copyKey="exp"
                  />

                  {/* Copy all keywords */}
                  <button
                    onClick={() =>
                      copyToClipboard(
                        [
                          ...keywords.hardSkills,
                          ...keywords.softSkills,
                          ...keywords.qualifications,
                          ...keywords.experience,
                        ].join(", "),
                        "all",
                      )
                    }
                    className="w-full bg-[#4a7c59] hover:bg-[#5a9c6e] text-white rounded-xl py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
                  >
                    {copied === "all"
                      ? "✓ All Keywords Copied!"
                      : "Copy All Keywords"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
