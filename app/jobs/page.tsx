"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { AppSidebar } from "../../components/app-sidebar";
import { SiteHeader } from "../../components/site-header";

/**
 * Represents a job listing as returned from the API.
 * Matches the JobRecord type from the repository layer.
 */
type Job = {
  rowKey: string;
  title: string;
  seniority: string;
  industry: string;
  description: string;
  requirements: string;
  atsKeywordsJson: string;
};

/**
 * Extracts the Overview section from a generated job description.
 * Falls back to the first sentence if no Overview section is found.
 */
function extractOverview(description: string): string {
  const overviewMatch = description.match(
    /overview[:\s]*([\s\S]*?)(?=key responsibilities|what we|$)/i,
  );
  if (overviewMatch) return overviewMatch[1].trim();
  return description.split("\n")[0] ?? description;
}

/**
 * Extracts the What We're Looking For section and splits into list items.
 * Lines are prefixed with '-' in the AI-generated output.
 */
function extractWhatWeLookingFor(description: string): string[] {
  const match = description.match(
    /what we(?:'re| are) looking for[:\s]*([\s\S]*?)(?=key responsibilities|overview|$)/i,
  );
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Extracts the Key Responsibilities section and splits into list items.
 * Lines are prefixed with '-' in the AI-generated output.
 */
function extractKeyResponsibilities(description: string): string[] {
  const match = description.match(
    /key responsibilities[:\s]*([\s\S]*?)(?=what we|overview|$)/i,
  );
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (!res.ok) {
          setErr(data.error);
          return;
        }
        setJobs(data.jobs);
      } catch (err: any) {
        setErr(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing)*72)",
          "--header-height": "calc(var(--spacing)*12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl text-gray-900 mb-1 font-serif font-normal">
                Job Listings
              </h1>
              <p className="text-sm text-gray-500 font-light">
                Manage your AI-generated job descriptions and ATS keywords.
              </p>
            </div>
            <a
              href="/jobs/new"
              className="bg-[#4a7c59] hover:bg-[#5a9c6e] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
            >
              + Generate New JD
            </a>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
                  <div className="h-5 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-4/5 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-100 rounded-full w-16" />
                    <div className="h-6 bg-gray-100 rounded-full w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {err && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {err}
            </p>
          )}

          {/* Empty state */}
          {!loading && !err && jobs.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-sm mb-4">No job listings yet.</p>
              <a
                href="/jobs/new"
                className="bg-[#4a7c59] hover:bg-[#5a9c6e] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                Generate your first JD
              </a>
            </div>
          )}

          {/* Job cards */}
          {!loading && !err && jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => {
                // Only show overview for AI-generated jobs that have atsKeywordsJson
                const isGenerated = !!job.atsKeywordsJson;
                const overview = isGenerated
                  ? extractOverview(job.description)
                  : job.description;

                return (
                  <div
                    key={job.rowKey}
                    onClick={() => router.push(`/jobs/${job.rowKey}`)}
                    className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#4a7c59] hover:shadow-md hover:shadow-[#4a7c59]/10 transition-all cursor-pointer group flex flex-col gap-3"
                  >
                    {/* Seniority + Industry badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {job.seniority && (
                        <span className="text-xs text-[#4a7c59] bg-[#4a7c59]/10 border border-[#4a7c59]/20 px-2.5 py-1 rounded-full font-medium">
                          {job.seniority}
                        </span>
                      )}
                      {job.industry && (
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                          {job.industry}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-medium text-gray-800 group-hover:text-[#4a7c59] transition-colors">
                      {job.title}
                    </h2>

                    {/* Overview */}
                    <p className="text-sm text-gray-500 leading-relaxed ">
                      {overview}
                    </p>

                    {/* What We're Looking For — shown before responsibilities */}
                    {isGenerated &&
                      extractWhatWeLookingFor(job.description).length > 0 && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                            What We're Looking For
                          </p>
                          <ul className="flex flex-col gap-1.5">
                            {extractWhatWeLookingFor(job.description).map(
                              (item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-gray-500 leading-relaxed"
                                >
                                  <span className="text-[#4a7c59] mt-1 shrink-0">
                                    •
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Key Responsibilities */}
                    {isGenerated &&
                      extractKeyResponsibilities(job.description).length >
                        0 && (
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                            Key Responsibilities
                          </p>
                          <ul className="flex flex-col gap-1.5">
                            {extractKeyResponsibilities(job.description).map(
                              (item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-gray-500 leading-relaxed"
                                >
                                  <span className="text-[#4a7c59] mt-1 shrink-0">
                                    •
                                  </span>
                                  <span>{item}</span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Requirements as tags */}
                    {job.requirements && (
                      <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-gray-50">
                        {job.requirements
                          .split(",")
                          .slice(0, 4)
                          .map((req) => (
                            <span
                              key={req}
                              className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-full"
                            >
                              {req.trim()}
                            </span>
                          ))}
                        {job.requirements.split(",").length > 4 && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            +{job.requirements.split(",").length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
