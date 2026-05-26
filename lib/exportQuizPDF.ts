import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions, Content } from "pdfmake/interfaces";
import { QuizQuestion } from "./types/quiz";

// Bind fonts to pdfmake (required for the browser)

export function exportQuizPDF(
  questions: QuizQuestion[],
  topic: string,
  includeAnswers: boolean,
): void {
  try {
    const anyPdfMake = pdfMake as any;
    const anyPdfFonts = pdfFonts as any;

    anyPdfMake.vfs = anyPdfFonts.pdfMake
      ? anyPdfFonts.pdfMake.vfs
      : anyPdfFonts.vfs;

    const content: Content[] = [];

    // --- Header Section ---
    // use a margin-less table to create a clean,
    // full-width colored background block
    content.push({
      table: {
        widths: ["*"],
        body: [
          [
            {
              stack: [
                { text: topic, style: "headerTitle" },
                {
                  text: includeAnswers
                    ? "Answer Key - Recruiter Copy"
                    : "Candidate Assessment",
                  style: "headerSubtitle",
                },
                {
                  text: `${questions.length} Questions. ${questions.filter((q) => q.type === "mcq").length} MCQ.  ${questions.filter((q) => q.type === "truefalse").length} True/False`,
                  style: "headerStats",
                },
              ],
              fillColor: "#4a7c59", // Green background
              margin: [30, 20, 30, 20],
              border: [false, false, false, false],
            },
          ],
        ],
      },
      layout: "noBorders",
      margin: [0, 0, 0, 20], // Bottom margin before questions start
    });

    // --- Questions Loop ---
    questions.forEach((q, index) => {
      // Question Type & Number
      content.push({
        text: `Question ${index + 1}. ${q.type === "mcq" ? "Multiple Choice" : "True/False"}`,
        style: "questionMeta",
      });

      // Question Text
      content.push({ text: q.question, style: "questionText" });

      // Options
      const optLetters = ["A", "B", "C", "D"];
      q.options.forEach((opt, optIndex) => {
        const isCorrect = opt === q.idealAnswer;
        const letter = optLetters[optIndex] ?? String(optIndex + 1);

        const showAsCorrect = includeAnswers && isCorrect;

        content.push({
          text: `${letter}. ${opt}`,
          style: "optionText",
          color: showAsCorrect ? "#4a7c59" : "#3c3c3c",
          bold: showAsCorrect,
        });
      });

      // Explanations (Recruiter Copy only)
      if (includeAnswers) {
        content.push({ text: "Correct Answer", style: "correctAnswerLabel" });
        content.push({ text: q.idealAnswer, style: "correctAnswerText" });

        if (q.explanation) {
          content.push({ text: "Explanation", style: "explanationLabel" });
          content.push({ text: q.explanation, style: "explanationText" });
        }
      }

      // Divider Line between questions
      content.push({
        canvas: [
          {
            type: "line",
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0, // A4 width minus margins (595 - 40 - 40)
            lineWidth: 1,
            lineColor: "#e6e6e6",
          },
        ],
        margin: [0, 15, 0, 15], // Spacing above and below the line
      });
    });

    // 2. Define the complete Document Structure
    const docDefinition: TDocumentDefinitions = {
      pageSize: "A4",
      pageOrientation: "portrait",
      // [left, top, right, bottom]
      pageMargins: [40, 20, 40, 40],

      // Footer function runs for every page automatically
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            {
              text: `${topic}. Page ${currentPage} of ${pageCount}`,
              alignment: "left",
            },
            {
              text: includeAnswers
                ? "Recruiter Copy - Confidential"
                : "Candidate Assessment",
              alignment: "right",
            },
          ],
          margin: [40, 0, 40, 0],
          fontSize: 8,
          color: "#a0a0a0",
        };
      },

      content: content,

      // 3. Centralized Styles (like CSS classes)
      styles: {
        headerTitle: {
          fontSize: 20,
          bold: true,
          color: "#ffffff",
          margin: [0, 0, 0, 4],
        },
        headerSubtitle: {
          fontSize: 10,
          color: "#ffffff",
          margin: [0, 0, 0, 6],
        },
        headerStats: { fontSize: 9, color: "#b4dcc3" },
        questionMeta: { fontSize: 9, color: "#787878", margin: [0, 0, 0, 4] },
        questionText: {
          fontSize: 11,
          bold: true,
          color: "#141414",
          margin: [0, 0, 0, 8],
        },
        optionText: { fontSize: 10, margin: [15, 0, 0, 4] }, // Indented left by 15
        correctAnswerLabel: {
          fontSize: 9,
          bold: true,
          color: "#4a7c59",
          margin: [0, 10, 0, 2],
        },
        correctAnswerText: {
          fontSize: 10,
          color: "#4a7c59",
          margin: [15, 0, 0, 5],
        },
        explanationLabel: {
          fontSize: 9,
          bold: true,
          color: "#c86464",
          margin: [0, 5, 0, 2],
        },
        explanationText: {
          fontSize: 10,
          color: "#505050",
          margin: [15, 0, 0, 0],
        },
      },
    };

    // 4. Generate and Download
    const safeTopic = topic
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    const suffix = includeAnswers ? "Answer_Key" : "Candidate";

    pdfMake
      .createPdf(docDefinition)
      .download(`${safeTopic}_Quiz_${suffix}.pdf`);

    console.log("PDF saved successfully!");
  } catch (err) {
    console.error("PDF generation Error : ", err);
  }
}
