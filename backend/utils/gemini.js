/**
 * Gemini integration utility
 *
 * Uses Google Generative AI REST API (models/{model}:generate) with API key.
 * Ensure GEMINI_API_KEY and GEMINI_MODEL are set in environment variables.
 *
 * The prompt template required by the spec is used in controllers. This file sends a single
 * text prompt and returns the model's textual response.
 *
 * Note: Adjust endpoint or auth method if you use OAuth or a different Google setup.
 */

const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-pro';
const BASE = process.env.GEMINI_ENDPOINT || 'https://generativeai.googleapis.com/v1/models';

/**
 * generateText(prompt) -> string response
 */
async function generateText(prompt) {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }
  const url = `${BASE}/${encodeURIComponent(MODEL)}:generate?key=${API_KEY}`;
  // The body format below follows typical Generative AI REST JSON. Adjust as needed for your access.
  const body = {
    prompt: {
      text: prompt
    },
    // A lightweight config
    temperature: 0.2,
    maxOutputTokens: 800
  };

  try {
    const resp = await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });
    // Response parsing: the exact shape depends on the API
    // Try common fields
    const data = resp.data;
    // Example response shapes:
    // { candidates: [{ output: "..." }] } or { text: "..." } or { generatedText: "..." }
    if (data?.candidates && data.candidates[0]?.output) {
      return data.candidates[0].output;
    }
    if (data?.candidates && data.candidates[0]?.content) {
      return data.candidates[0].content;
    }
    if (data?.output?.[0]?.content?.[0]?.text) {
      return data.output[0].content[0].text;
    }
    if (data?.text) {
      return data.text;
    }
    return JSON.stringify(data);
  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message);
    throw new Error('Failed to contact Gemini API');
  }
}

module.exports = {
  generateText
};