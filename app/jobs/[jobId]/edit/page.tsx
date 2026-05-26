"use client";

import React, { useEffect, useState } from "react";
import { AppSidebar } from "../../../../components/app-sidebar";
import { SiteHeader } from "../../../../components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "../../../../components/ui/sidebar";
import { ATSKeywords, EditableJob } from "../../../../lib/types/job";
import { useParams, useRouter } from "next/navigation";

const SENIORITY_OPTIONS = [
  "Intern",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Manager",
];

const INDUSTRY_OPTIONS = [
  "Technology",
  "Finance",
  "HealthCare",
  "Education",
  "Marketing",
  "Legal",
  "Engineering",
];

export default function EditJobPage() {
  const params = useParams();
  const jobId = params.jobId;
  const router = useRouter();
  const [form, setForm] = useState<EditableJob>({
    title: "",
    seniority: "",
    industry: "",
    description: "",
    atsKeywords: {
      hardSkills: [],
      softSkills: [],
      qualifications: [],
      experience: [],
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerate] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const [newKeyword, setNewKeyword] = useState({
    hardSkills: "",
    softSkills: "",
    qualifications: "",
    experience: "",
  });

  useEffect(() => {
    if (!jobId) return;
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        const keywords: ATSKeywords = data.job.atsKeywordsJson
          ? JSON.parse(data.job.atsKeywordsJson)
          : {
              hardSkills: [],
              softSkills: [],
              qualifications: [],
              experience: [],
            };

        setForm({
          title: data.job.title,
          seniority: data.job.seniority,
          industry: data.job.industry,
          description: data.job.description,
          atsKeywords: keywords,
        });
      } catch (err: any) {
        setErr(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [jobId]);

  function addKeyword(category: keyof ATSKeywords) {
    const value = newKeyword[category].trim();
    if (!value) return;
    if (form.atsKeywords[category].includes(value)) return;
    setForm((prev) => ({
      ...prev,
      atsKeywords: {
        ...prev.atsKeywords,
        [category]: [...prev.atsKeywords[category], value],
      },
    }));
  }

  function removeKeyword(category: keyof ATSKeywords, keyword: string) {
    setForm((prev) => ({
      ...prev,
      atsKeywords: {
        ...prev.atsKeywords,
        [category]: prev.atsKeywords[category].filter((kw) => kw !== keyword),
      },
    }));
  }

  function handleFieldChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSave() {
    setSaving(true);
    setErr("");
    setSuccess("");
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          Content_Type: "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          seniority: form.seniority,
          industry: form.industry,
          description: form.description,
          requirements: [
            ...form.atsKeywords.hardSkills,
            ...form.atsKeywords.softSkills,
          ].join(","),
          atsKeywordsJson: JSON.stringify(form.atsKeywords),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Changes saved successfully");
      setTimeout(() => router.push(`/jobs/${jobId}`), 1500);
    } catch (err: any) {
      setErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerate() {
    setRegenerate(true);
    setErr("");
    setSuccess("");
    try {
      const res = await fetch(`/api/job/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          seniority: form.seniority,
          industry: form.industry,
          responsibilities: form.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("JD regenerated Successfully");
      setTimeout(() => router.push(`/jobs/${data.jobId}/edit`));
    } catch (err: any) {
      setErr(err.message);
    } finally {
      setRegenerate(false);
    }
  }

  function KeywordEditor({
    label,
    category,
    color,
  }: {
    label: string;
    category: keyof ATSKeywords;
    color: string;
  }) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <div className="flex flex-wrap gap-2">
          {form.atsKeywords[category].map((kw) => (
            <span
              key={kw}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5 ${color}`}
            >
              {kw}
              <button
                className="hover:opacity-60 transition-opacity"
                onClick={() => removeKeyword(category, kw)}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            onChange={(e) =>
              setNewKeyword((prev) => ({ ...prev, [category]: e.target.value }))
            }
            onKeyDown={(e) => e.key === "Enter" && addKeyword(category)}
            value={newKeyword[category]}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all"
          />
        </div>
        <button
          className="bg-[#4a7c59]/10 hover:bg-[#4a7c59]/20 text-[#4a7c59] px-4 py-2 rounded-xl text-sm font-medium transition-all"
          onClick={() => addKeyword(category)}
        >
          Add
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col p-6 gap-4 max-w-4xl">
            <div className="animate-pulse flex flex-col gap-4">
              <div className="h-8 bg-gray-600 rounded-xl w-1/3" />
              <div className="h-64 bg-gray-500 rounded-xl " />
              <div className="h-32 bg-gray-700 rounded-xl " />
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
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 max-w-4xl ">
          <div className="flex items-start justify-between ">
            <div>
              <p className="text-2xl text-gray-900 font-serif font-normal mb-1">
                Edit Job Post
              </p>
              <p className="text-sm text-gray-500">
                tailor the job post to your preferences
              </p>
            </div>
            <a
              className="text-sm text-gray-400 hover:text-[#4a7c59] transition-colors shrink-0 mt-1"
              href={`/jobs/${jobId}`}
            >
              Back
            </a>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* job description */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {/* Title */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                  Job Details
                </p>
                <label className="text-xs font-medium text-gray-800 uppercase tracking-widest">
                  Job Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={handleFieldChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all"
                />
                <div className="grid grid-cols-2 gap-4 ">
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Seniority
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all bg-white"
                    name="seniority"
                    value={form.seniority}
                    onChange={handleFieldChange}
                  >
                    {SENIORITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    Industry
                  </label>
                  <select
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all bg-white"
                    name="industry"
                    value={form.industry}
                    onChange={handleFieldChange}
                  >
                    {INDUSTRY_OPTIONS.map((opt) => (
                      <option key={opt} value="{opt}">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-3">
                  <p>Job Description</p>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFieldChange}
                    rows={20}
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                  ATS Keywords
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Add or remove keywords per category. Press Enter or click Add.
                </p>
              </div>
              {/* ATS keywords */}
              <KeywordEditor
                label="Hard Skills"
                category="hardSkills"
                color="bg-blue-50 text-blue-600 border-blue-100"
              />
              <KeywordEditor
                label="Soft Skills"
                category="softSkills"
                color="bg-purple-50 text-purple-600 border-purple-100"
              />
              <KeywordEditor
                label="Qualifications"
                category="qualifications"
                color="bg-amber-50 text-amber-600 border-amber-100"
              />
              <KeywordEditor
                label="Experience"
                category="experience"
                color="bg-[#4a7c59]/10 text-[#4a7c59] border-[#4a7c59]/20"
              />
            </div>
          </div>
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
          <div className=" flex gap-4 ">
            <button
              className="flex-1 bg-[#4a7c59] hover:bg-[#5a9c6e] disabled:opacity-40 text-white rounded-xl py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
              onClick={handleSave}
              disabled={saving || regenerating}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              className="flex-1 bg-white border border-gray-200 hover:border-[#4a7c59] text-gray-600 hover:text-[#4a7c59] disabled:opacity-40 rounded-xl py-3.5 text-sm font-medium transition-all"
              onClick={handleRegenerate}
              disabled={saving || regenerating}
            >
              {regenerating ? "Regenerating..." : "Regenerate with AI"}
            </button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
