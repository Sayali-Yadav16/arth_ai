const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

async function generateText(prompt) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const url = `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 800
    }
  };

  try {
    const response = await axios.post(url, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 60000
    });

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "No response from Gemini";

  } catch (err) {
    console.error(
      "Gemini API error:",
      err?.response?.data || err.message
    );
    throw new Error("Failed to contact Gemini API");
  }
}

module.exports = { generateText };