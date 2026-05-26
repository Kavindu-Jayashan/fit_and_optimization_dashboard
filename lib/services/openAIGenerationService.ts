import { IJobGenerationService } from "../interfaces/IJobGenerationService";
import OpenAI from "openai";
import { GeneratedJob } from "../types/job";

export function createOpenAIGenerationService(): IJobGenerationService {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  //   generate a professional job description and categorized keywords
  async function generate(
    title: string,
    seniority: string,
    industry: string,
    responsibilities: string,
  ): Promise<GeneratedJob> {
    const prompt = `You are an expert HR consultant and recruitment specialist.
    Generate a professional job description and ATS keyword list based on the following inputs:

    Job Title: ${title}
    Seniority: ${seniority}
    Industry: ${industry}
    Key Responsibilities: ${responsibilities}

    Respond ONLY with a valid JSON object in exactly this structure, no markdown, no explanation:
    {
        "jobDescription": "Write the ENTIRE job description as a single plain text string with at least 300 words. Include Overview, Key Responsibilities, and What We're Looking For sections separated by newlines. Do NOT use nested objects or arrays for this field.",
        "atsKeywords": {
            "hardSkills": ["skill1", "skill2", "skill3"],
            "softSkills": ["skill1", "skill2", "skill3"],
            "qualifications": ["qualification1","qualification2"],
            "experience": ["experience requirement1","experience requirement2"]
        }
    }
`;

    const res = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      // max_tokens: 2000,
    });

    const raw = res.choices[0].message.content ?? "";

    // clean the raw response got from the AI to remove unwanted markdowns
    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      //   handles if the job description returns as a nested object
      let jobDescription = parsed.jobDescription;
      if (typeof jobDescription === "object") {
        jobDescription = Object.entries(jobDescription)
          .map(([key, value]) => `${key}\n${value}`)
          .join("\n\n");
      }
      return {
        title,
        seniority,
        industry,
        jobDescription: String(jobDescription),
        atsKeywords: parsed.atsKeywords,
      };
    } catch {
      throw new Error("Failed to parse AI response. Please try again.");
    }
  }
  return { generate };
}
