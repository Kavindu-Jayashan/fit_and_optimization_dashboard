import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export type ATSKeywords = {
  hardSkills: string[];
  softSkills: string[];
  qualifications: string[];
  experience: string[];
};

export type GeneratedJob = {
  title: string;
  seniority: string;
  industry: string;
  jobDescription: string;
  atsKeywords: ATSKeywords;
};

export async function generateJobDescription(
  title: string,
  seniority: string,
  industry: string,
  responsibilities: string,
): Promise<GeneratedJob> {
  const prompt = `
    Ypu are an expert HR consultant and recruitment specialist.
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

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const raw = response.choices[0].message.content ?? "";
  console.log("Raw OpenAI response:", raw);

  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    console.log("Cleaned response:", clean.substring(0, 200));
    const parsed = JSON.parse(clean);

    let jobDescription = parsed.jobDescription;
    if (typeof jobDescription === "object") {
      jobDescription = Object.entries(jobDescription)
        .map(([key, value]) => `${key}\n${value}`)
        .join("\n\n");
    }

    console.log("jobDescription type:", typeof parsed.jobDescription);
    console.log(
      "jobDescription value:",
      parsed.jobDescription?.substring(0, 100),
    );
    return {
      title,
      seniority,
      industry,
      jobDescription: parsed.jobDescription,
      atsKeywords: parsed.atsKeywords,
    };
  } catch (e) {
    console.error("Parse error:", e);
    console.error("Raw was:", raw);
    throw new Error("Failed to parse response. Please try again.");
  }
}
