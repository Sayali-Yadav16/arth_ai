const dotenv = require("dotenv");
dotenv.config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash"
  });

  console.log("Starting Gemini test with model:", process.env.GEMINI_MODEL || "gemini-1.5-flash");
  try {
    const result = await model.generateContent("Explain income tax in 2 lines");
    console.log("Response length:", result.response.text().length);
    console.log("Response:", result.response.text());
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

test().then(() => console.log("Test finished")).catch(err => console.error(err));