"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { AppSidebar } from "../../components/app-sidebar";
import { SiteHeader } from "../../components/site-header";
import { SidebarInset, SidebarProvider } from "../../components/ui/sidebar";
import { useSearchParams } from "next/navigation";

type Job = {
  rowKey: string;
  title: string;
  description: string;
  requirements: string | null | undefined;
  company: string;
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");

  const [job, setJob] = useState<Job | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    extractedText?: string;
    characterCount?: number;
    url?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchJob() {
      if (!jobId) {
        setJobLoading(false);
        return;
      }
      try {
        const res = await fetch("api/jobs/");
        const data = await res.json();
        const found = data.jobs.find((j: Job) => j.rowKey === jobId);
        setJob(found || null);
      } catch {
        setError("failed to load job details");
      } finally {
        setJobLoading(false);
      }
    }
    fetchJob();
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  }

  function validateAndSetFile(file: File) {
    setError("");
    setUploadResult(null);
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordpressingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Only PDF and DOCX files are supported");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("file Size must be under 5MB");
      return;
    }
    setFile(file);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("cv", file);
      const res = await fetch("api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUploadResult(data);
    } catch (err: any) {
      setError(err.message || "upload failed. please try again");
    } finally {
      setUploading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setUploadResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing)*72)",
          "--header-height": "calc(var(--spacing)*12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="p-3">
          <div>
            <h1 className="text-2xl text-gray-900 mb-1 font-serif font-normal">
              DashBoard
            </h1>
            <p className="text-sm text-gray-500">
              upload the cv to match it against the selected job.
            </p>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all
                ${dragOver ? "border-[#4a7c59] bg-[#4a7c59]/5 " : "border-gray-200 hover:border-[#4a7c59] hover:bg-gray-50"}
                ${file ? "cursor-default" : "cursor-pointer"}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf, .docx"
                className="hidden"
                onChange={handleFileChange}
              />

              {!file ? (
                <>
                  <div className="w-12 h-12 bg-[#4a7c59]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-[#4a7c59]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drag & drop your CV here
                  </p>
                  <p className="text-xs text-gray-400">PDF or DOCX - max 5MB</p>
                </>
              ) : (
                <div className="flex items-center justify-between bg-[#4a7c59]/5 border border-[#4a7c59]/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#4a7c59]/10 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-[#4a7c59]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {error && (
              <p className=" text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {file && !uploadResult && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-[#4a7c59] hover:bg-[#5a9c6e] disabled:opacity-40 text-white rounded-xl py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
              >
                {uploading
                  ? "Uploading & Extracting text ..."
                  : "Upload & Analyze CV"}
              </button>
            )}

            {uploadResult?.success && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-[#4a7c59] rounded-full flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    CV Uploaded successfully
                  </span>
                </div>
                <div className="flex gap-4 mb-4">
                  <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1 text-center">
                    <p className="text-2xl font-semibold text-[#4a7c59]">
                      {uploadResult.characterCount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {" "}
                      Characters Extracted
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-4 py-3 flex-1 text-center">
                    <p className="text-2xl font-semibold text-[#4a7c59]">
                      {uploadResult.extractedText
                        ?.split(/\s+/)
                        .filter(Boolean)
                        .length.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Words Extracted
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="tex-xs text-gray-400 mb-2 uppercase tracking-widest font-medium">
                    Preview
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-4">
                    {uploadResult.extractedText}
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-4 w-full border border-gray-200 hover:border-[#4a7c59] text-gray-500 hover:text-[#4a7c59] rounded-xl py-2.5 text-sm transition-all"
                >
                  Upload a different CV
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-4">
                Selected Position
              </p>
              {jobLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-100 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              ) : !job ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400">No job selected.</p>
                  <a
                    href="/jobs"
                    className="text-xs text-[#4a7c59] hover:underline mt-2 block"
                  >
                    Browse job listings →
                  </a>
                </div>
              ) : (
                <>
                  <h2 className="text-base font-medium text-gray-800 mb-2">
                    {job.title}
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {job.description}
                  </p>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-2">
                      Requirements
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(job.requirements ?? "").split(",").map((req) => (
                        <span
                          key={req}
                          className="text-xs bg-[#4a7c59]/10 text-[#4a7c59] border border-[#4a7c59]/20 px-3 py-1 rounded-full"
                        >
                          {req.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href="/jobs"
                    className="mt-4 block text-xs text-gray-400 hover:text-[#4a7c59] transition-colors"
                  >
                    ← Change position
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
