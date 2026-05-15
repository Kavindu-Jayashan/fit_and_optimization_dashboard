import { OpenAI } from "openai";
import { IQuizGenerationService } from "../interfaces/IQuizGenerationService";
import { GenerateQuizInput, QuizQuestion } from "../types/quiz";

// generating MCQ , true-false and short answer questions
// based on the job description provided
// or manually entered topic
export function createQuizGenerationService(): IQuizGenerationService {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  // generate questions via AI
  // mcq - 50% tf-20% sa-30%
  async function generate(input: GenerateQuizInput): Promise<QuizQuestion[]> {
    const { questionCount, topic, jobTitle, jobDescription } = input;

    const mcqCount = Math.ceil(questionCount * 0.5);
    const tfCount = Math.ceil(questionCount * 0.2);
    const saCount = questionCount - mcqCount - tfCount;

    const context = jobDescription
      ? `Job Title: ${jobTitle}\nJob Description:\n ${jobDescription} `
      : `Topic : ${topic}`;

    const questions: QuizQuestion[] = [];

    for (let i = 0; i < questionCount; i++) {
      const type = i < Math.ceil(questionCount * 0.5) ? "mcq" : "truefalse";

      const prompt = `
You are an expert technical recruiter creating a screening quiz.
Generate exactly ONE ${type === "mcq" ? "multiple choice" : "true/false"} question based on this context:

${context}

Already generated questions (do not repeat these topics):
${questions.map((q, idx) => `${idx + 1}. ${q.question}`).join("\n") || "None yet"}

Respond ONLY with a single valid JSON object. No array, no markdown, no explanation:
${
  type === "mcq"
    ? `{
  "id": "q${i + 1}",
  "type": "mcq",
  "question": "Question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "idealAnswer": "Option A",
  "explanation": "Why this is correct"
}`
    : `{
  "id": "q${i + 1}",
  "type": "truefalse",
  "question": "Statement here?",
  "options": ["True", "False"],
  "idealAnswer": "True",
  "explanation": "Why this is correct"
}`
}`;

      const res = await client.chat.completions.create({
        model: "gpt-5.4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const raw = (res.choices[0].message.content ?? "").trim();

      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        console.log("cleaned response: ", clean);
        const parsed = JSON.parse(clean);
        console.log("parsed response:", parsed);
        questions.push({
          id: parsed.id ?? `q${i + 1}`,
          type: parsed.type ?? "mcq",
          question: parsed.question ?? "",
          options: parsed.options ?? [],
          idealAnswer: parsed.idealAnswer ?? parsed.answer ?? "",
          explanation: parsed.explanation ?? "",
        });
        console.log(
          `Pushed Questions ${i + 1} , Total so far : `,
          questions.length,
        );
      } catch {
        console.error(`Failed to parse question ${i + 1} - skipping`);
      }
    }

    questions.forEach((q, i) => {
      console.log(`Q${i + 1} check:`, {
        hasQuestion: !!q.question,
        optionsLength: q.options?.length,
        hasCorrectAnswer: !!q.idealAnswer,
        idealAnswer: q.idealAnswer,
        options: q.options,
      });
    });

    const filtered = questions.filter(
      (q) => q.question && q.options.length >= 2 && q.idealAnswer,
    );
    console.log(
      "Before filter:",
      questions.length,
      "After filter:",
      filtered.length,
    );
    console.log("Filtered questions:", JSON.stringify(filtered, null, 2));

    return filtered;

    //     const prompt = `You are an expert technical interviewer creating a screening quiz.
    //       based on the following context , generate exactly ${questionCount} questions:
    //       - ${mcqCount} multiple choice questions (MCQ)
    //       - ${tfCount} true/false questions
    //       - ${saCount} short answer questions

    //       context: ${context}

    //       respond only with a valid JSON array in exactly this structure , no markdown , no explanation:
    //       [
    //       {
    //         "id":"q1",
    //         "type":"mcq",
    //         "question" : "Question text here?",
    //         "options":["option A" ,"option B","option C","option D"],
    //         "idealAnswer": "Option A",
    //         "explanation": "Brief explanation of why this is correct"

    //       },
    //       {"id":"q2",
    //       "type":"truefalse",
    //       "question" : "Question text here?",
    //       "idealAnswer": "True",
    //       "explanation":"Brief explanation of why this is correct"
    // },{
    // "id":"q3",
    // "type":"shortanswer",
    // "question": "Question text here?",
    // "idealAnswer": "Answer here",
    // "explanation":"brief explanation why this is the answer"
    // }]
    //       Rules:
    //       -MCQ must have exactly 4 options
    //       -trueFalse must have exactly ["True","False" ] as options
    //       -idealAnswer must exactly match on eof the options
    //       -questions must be relevant to the context provided
    //       -mix the question type throughout , do not group them
    //     `;

    // const res = await client.chat.completions.create({
    //   model: "gpt-5.4",
    //   messages: [{ role: "user", content: prompt }],
    //   response_format: { type: "json_object" },
    //   // max_tokens: 8000,
    //   temperature: 0.7,
    // });

    // const raw = res.choices[0].message.content ?? "";
    // console.log("Raw quiz response: ", raw);
    // console.log("raw length: ", raw.length);

    // // clean the raw response got from the AI to remove unwanted markdowns
    // try {
    //   const clean = raw.replace(/```json|```/g, "").trim();
    //   console.log("Cleaned: ", clean.substring(0, 300));
    //   let parsed: QuizQuestion[];
    //   if (clean.startsWith("{")) {
    //     parsed = [JSON.parse(clean)];
    //   } else {
    //     parsed = JSON.parse(clean);
    //   }
    //   // const parsed: QuizQuestion[] = JSON.parse(clean);

    //   // validate each question has required data
    //   // return parsed.filter(
    //   //   (q) =>
    //   //     q.id &&
    //   //     q.type &&
    //   //     q.question &&
    //   //     Array.isArray(q.options) &&
    //   //     q.options.length >= 2 &&
    //   //     q.idealAnswer &&
    //   //     q.explanation,
    //   // );

    //   const normalized = parsed.map((q: any, index: number) => ({
    //     id: q.id ?? `q${index + 1}`,
    //     type: q.type ?? "mcq",
    //     question: q.question ?? "",
    //     options: q.options ?? [],
    //     idealAnswer: q.idealAnswer ?? "",
    //     explanation: q.explanation ?? "",
    //   }));

    //   return normalized.filter(
    //     (q) =>
    //       q.question &&
    //       Array.isArray(q.options) &&
    //       q.options.length >= 2 &&
    //       q.idealAnswer,
    //   );
    //   } catch {
    //     throw new Error("Failed to parse AI response. please try again.");
    //   }
    // }
    //
  }
  return { generate };
}
