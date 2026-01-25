
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function chatWithGraph(query, context) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const prompt = `
  You are a professional Tax Analysis Assistant. 
  Answer the user's question based strictly on the provided tax document context.
  Do not give generic tax advice. If the answer is not in the context, say so.

  Context from Documents:
  ${context}

  User Question: ${query}

  Answer (concise and professional):
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
