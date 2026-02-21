import { GoogleGenerativeAI } from "@google/generative-ai";

export async function embedText(text) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004"
  });
  const result = await model.embedContent(text);
  return result.embedding.values;
}
