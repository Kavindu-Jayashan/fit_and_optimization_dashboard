"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SidebarInset, SidebarProvider } from "../../../components/ui/sidebar";
import { AppSidebar } from "../../../components/app-sidebar";
import { SiteHeader } from "../../../components/site-header";


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

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    seniority: "",
    industry: "",
    responsibilities: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    setError("");

    if (
      !form.title ||
      !form.seniority ||
      !form.industry ||
      !form.responsibilities
    ) {
      setError("All fields are required");
      return;
    }

    if (form.responsibilities.length < 20) {
      setError("Please provide more details on the responsibilities.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/jobs/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      router.push(`/jobs/${data.jobId}`);
    } catch (err: any) {
      setError(err.message || "Failed to generate job description");
    } finally {
      setLoading(false);
    }
  }

  const isValid =
    form.title &&
    form.seniority &&
    form.industry &&
    form.responsibilities.length >= 20;

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
      <SidebarInset className="bg-[#141416]/8">
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6 max-w-3xl">
          <div>
            <h1 className="text-2xl text-gray-900 mb-1 font-serif font-normal">
              Generate Job Description
            </h1>
            <p className="text-sm text-gray-500">
              Fill in the Details and AI will generate a full JD with ATS
              keywords.
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor=""
                className="text-xs font-medium text-gray-400 uppercase tracking-widest"
              >
                Job Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Software Engineer , Product Manager"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-medium text-gray-400 uppercase tracking-widest"
                  htmlFor=""
                >
                  Level
                </label>
                <select
                  name="seniority"
                  value={form.seniority}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all bg-white"
                >
                  <option value="">Select Level</option>
                  {SENIORITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label
                  className="text-xs font-medium text-gray-400 uppercase tracking-widest"
                  htmlFor=""
                >
                  Industry
                </label>
                <select
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all bg-white"
                >
                  <option value="">Select Industry</option>
                  {INDUSTRY_OPTIONS.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-medium text-gray-400 uppercase tracking-widest"
                htmlFor=""
              >
                Responsibilities & Requirements
              </label>
              <textarea
                name="responsibilities"
                value={form.responsibilities}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#4a7c59] focus:ring-2 focus:ring-[#4a7c59]/20 transition-all resize-none"
                rows={6}
                placeholder="e.g. Build and maintain REST APIs, collaborate with cross-functional teams, lead code reviews, 3+ years of React experience required..."
              />
              <p className="text-xs text-gray-300 text-right">
                {form.responsibilities.length} characters
                {form.responsibilities.length < 20 &&
                  form.responsibilities.length > 0 && (
                    <span className="text-amber-400">
                      {" "}
                      — add a bit more detail
                    </span>
                  )}
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !isValid}
              className="w-full bg-[#4a7c59] hover:bg-[#5a9c6e] disabled:opacity-40 text-white rounded-xl py-3.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
            >
              {loading
                ? "Generating with AI - this may take a few seconds..."
                : "Generate Job Description"}
            </button>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
