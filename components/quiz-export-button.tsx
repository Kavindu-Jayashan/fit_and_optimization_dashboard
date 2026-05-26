"use client";

import { useState } from "react";
import { IQuizExport } from "../lib/interfaces/IQuizExport";
import { exportQuizPDF } from "../lib/exportQuizPDF";

export function QuizExportButton({
  topic,
  questions,
  variant = "outline",
}: IQuizExport) {
  const [open, setOpen] = useState(false);

  function handleExport(includeAnswers: boolean) {
    setOpen(false);
    exportQuizPDF(questions, topic, includeAnswers);
  }

  const baseClass =
    variant === "solid"
      ? "flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium transition-all"
      : "text-xs text-gray-400 hover:text-[#4a7c59] border border-gray-200 hover:border-[#4a7c59] px-2.5 py-1 rounded-lg transition-all";

  return (
    <div className="relative">
      <button onClick={() => setOpen((prev) => !prev)} className={baseClass}>
        {variant === "solid" ? "Export PDF" : "Export"}
      </button>

      {open && (
        <>
          {/* this makes clicking outside the dropdown to close it */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden w-52">
            <button
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
              onClick={() => handleExport(false)}
            >
              <p className="font-medium">Candidate Version</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Questions + Options , No answers
              </p>
            </button>
            <button
              onClick={() => handleExport(true)}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-[#4a7c59]">Recruiter Copy</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Includes correct answers
              </p>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
