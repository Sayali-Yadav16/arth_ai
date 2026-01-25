export async function generateTaxAnalysis(context, genAI) {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

  const prompt = `
You are a tax expert AI.
Analyze the uploaded tax documents and respond in JSON.

Context:
${context}

Return JSON with:
summary
key_findings (array)
recommendations (array)
compliance_check
`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
