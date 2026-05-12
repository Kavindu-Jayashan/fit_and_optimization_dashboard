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

    const prompt = `You are an expert technical interviewer creating a screening quiz.
      based on the following context , generate exactly ${questionCount} questions:
      - ${mcqCount} multiple choice questions (MCQ)
      - ${tfCount} true/false questions
      - ${saCount} short answer questions 

      context: ${context}

      respond only with a valid JSON array in exactly this structure , no markdown , no explanation:
      [
      {
        "id":"q1",
        "type":"mcq",
        "question" : "Question text here?",
        "options":["option A" ,"option B","option C","option D"],
        "idealAnswer": "Option A",
        "explanation": "Brief explanation of why this is correct"

      },
      {"id":"q2",
      "type":"truefalse",
      "question" : "Question text here?",
      "idealAnswer": "True",
      "explanation":"Brief explanation of why this is correct"
},{
"id":"q3",
"type":"shortanswer",
"question": "Question text here?",
"idealAnswer": "Answer here",
"explanation":"brief explanation why this is the answer"
}]
      Rules:
      -MCQ must have exactly 4 options
      -trueFalse must have exactly ["True","False" ] as options
      -correctAnswer must exactly match on eof the options
      -questions must be relevant to the context provided
      -mix the question type throughout , do not group them
    `;

    const res = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 3000,
      temperature: 0.7,
    });

    const raw = res.choices[0].message.content ?? "";

    // clean the raw response got from the AI to remove unwanted markdowns
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed: QuizQuestion[] = JSON.parse(clean);

      // validate each question has required data
      return parsed.filter(
        (q) =>
          q.id &&
          q.type &&
          q.question &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          q.idealAnswer &&
          q.explanation,
      );
    } catch {
      throw new Error("Failed to parse AI response. please try again.");
    }
  }
  return { generate };
}
