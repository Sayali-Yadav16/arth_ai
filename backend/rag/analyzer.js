import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAnalysis(context) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite"
  });

  const prompt = `
You are a professional Indian tax assistant.

Analyze the following tax documents and return STRICT JSON:

{
  "summary": "...",
  "key_findings": ["..."],
  "recommendations": ["..."],
  "compliance_check": "..."
}


Tax Documents:
${context}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    console.error("Raw Text:", text);
    throw e;
  }
}
