"use client";

import { useState } from "react";
import { QuizQuestion } from "../lib/types/quiz";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { QuizExportButton } from "./quiz-export-button";

interface QuizPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  quizId: string;
  topic: string;
  questions: QuizQuestion[];
  onSave: (update: QuizQuestion[]) => void;
}

function EditableText({
  value,
  onChange,
  multiLine = false,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  multiLine?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return multiLine ? (
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className={`w-full border border-[#4a7c59] rounded-lg px-3 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-[#4a7c59]/20 transition-all ${className}`}
        rows={3}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        className={`w-full border border-[#4a7c59] rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4a7c59]/20 transition-all ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`cursor-text hover:bg-[#4a7c59]/5 rounded px-1 -mx-1 transition-colors ${className}`}
    >
      {value || <span className="text-gray-300 italic"> Click to Edit </span>}
    </span>
  );
}

export function QuizPreviewDialog({
  open,
  onClose,
  quizId,
  topic,
  questions: initialQuestions,
  onSave,
}: QuizPreviewDialogProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateQuestions(
    index: number,
    field: keyof QuizQuestion,
    value: string,
  ) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  }

  function updateOption(
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        const newOptions = [...q.options];
        const wasCorrect = newOptions[optionIndex] === q.idealAnswer;
        return {
          ...q,
          options: newOptions,
          idealAnswer: wasCorrect ? value : q.idealAnswer,
        };
      }),
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/quiz/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected: questions, all: questions }),
      });

      if (!res.ok) throw new Error("Failed to Save the Changes.");
      onSave(questions);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (err) {
      console.error("Saving error : ", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl! max-h-[80vh]  flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border border-gray-100 shrink-0">
          <DialogTitle className="font-serif font-normal text-xl text-gray-900">
            {topic}
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">
            {questions.length} questions. Click any Text to Edit inline
          </p>
          <div className="flex justify-end">
            <QuizExportButton
              topic={topic}
              questions={questions}
              variant="solid"
            />
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400">
                  Q{index + 1}
                </span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                    q.type === "mcq"
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : "bg-purple-50 text-purple-600 border-purple-100"
                  }`}
                >
                  {q.type === "mcq" ? "MCQ" : "T/F"}
                </span>
              </div>

              <div className="text-sm font-medium text-gray-800 leading-relaxed">
                <EditableText
                  value={q.question}
                  onChange={(val) => updateQuestions(index, "question", val)}
                  multiLine
                />
              </div>

              <div className="flex flex-col gap-2">
                {q.options.map((opt, optIndex) => {
                  const isCorrect = opt === q.idealAnswer;
                  return (
                    <div
                      key={optIndex}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                        isCorrect
                          ? "bg-[#4a7c59]/10 border-[#4a7c59]/20 text-[#4a7c59]"
                          : "bg-gray-50 border-gray-100 text-gray-600"
                      }`}
                    >
                      <button
                        onClick={() =>
                          updateQuestions(index, "idealAnswer", opt)
                        }
                        title={isCorrect ? "Correct Answer" : "Mark as Correct"}
                        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                          isCorrect
                            ? "bg-[#4a7c59] border-[#4a7c59]"
                            : "border-gray-300 hover:border-[#4a7c59]"
                        }`}
                      >
                        {isCorrect && (
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
                      </button>

                      {q.type === "mcq" ? (
                        <EditableText
                          value={opt}
                          onChange={(val) => updateOption(index, optIndex, val)}
                          className="flex-1 font-medium"
                        />
                      ) : (
                        <span className="flex-1 font-medium">{opt}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-50 pt-3">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest font-medium">
                  Explanation
                </p>
                <div className="text-xs text-gray-500 leading-relaxed italic">
                  <EditableText
                    value={q.explanation}
                    onChange={(val) =>
                      updateQuestions(index, "explanation", val)
                    }
                    multiLine
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter className="px-6 py-4 border-t border-gray-100 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-500 rounded-xl py-2.5 text-sm font-medium transition-all"
          >
            Close
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#4a7c59] hover:bg-[#5a9c6e] disabled:opacity-40 text-white rounded-xl py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4a7c59]/30"
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
