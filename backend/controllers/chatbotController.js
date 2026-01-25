const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

/**
 * POST /api/chatbot/ask
 * Chat endpoint for tax-related questions using Gemini API
 */
exports.askQuestion = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === '') {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API configuration error' });
    }

    const prompt = `You are TaxBuddy AI, a friendly and helpful Indian tax assistant.

Your role:
- Answer tax-related questions clearly and accurately
- Focus on Indian income tax (old regime, new regime, deductions, etc.)
- Provide practical advice for tax savings
- Explain complex tax concepts in simple language
- Be conversational and encouraging

Guidelines:
- Keep responses concise (under 200 words)
- Use rupee symbol (₹) for amounts
- Mention relevant tax sections when applicable
- Always encourage consulting a CA for complex cases
- If the question is not tax-related, politely redirect

User Question: ${question}

Respond in a helpful, friendly manner.`;

    try {
      const response = await axios.post(
        `https://generativeai.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        { timeout: 10000 }
      );

      if (!response.data.candidates || !response.data.candidates[0]) {
        throw new Error('Invalid response from Gemini API');
      }

      const answer = response.data.candidates[0].content.parts[0].text;
      res.json({ answer });
    } catch (apiErr) {
      console.error('Gemini API Error:', apiErr.response?.data || apiErr.message);
      
      // Fallback responses for different question types
      let fallbackAnswer = '';
      const q = question.toLowerCase();

      if (q.includes('old regime') || q.includes('new regime')) {
        fallbackAnswer = `Old Regime vs New Regime:

**Old Regime:**
- Allows deductions (80C, 80D, etc.)
- Tax slabs: 0-2.5L (0%), 2.5L-5L (5%), 5L-10L (20%), 10L+ (30%)
- Good for high deductions

**New Regime:**
- No deductions on income
- Lower tax slabs: 0-3L (0%), 3L-6L (5%), 6L-9L (10%), etc.
- Good if deductions are minimal

Compare both and choose the better one for your situation!`;
      } else if (q.includes('deduction') || q.includes('80c') || q.includes('80d')) {
        fallbackAnswer = `Tax Deductions Guide:

**Section 80C (Max ₹1,50,000):**
- Life insurance premiums
- ELSS (Equity Linked Savings Scheme)
- EPF contributions
- PPF (Public Provident Fund)
- Home loan principal repayment

**Section 80D (Health Insurance):**
- Self + dependent: ₹25,000
- Senior citizen: ₹50,000
- Parent senior citizen: Add ₹50,000

Plan your investments to maximize deductions!`;
      } else if (q.includes('nps') || q.includes('pension')) {
        fallbackAnswer = `National Pension Scheme (NPS) Benefits:

**Under Section 80C:**
- Main contribution: Up to ₹1,50,000 (includes other 80C investments)

**Under Section 80CCD(1B):**
- Extra ₹50,000 deduction (in addition to 80C limit)
- Total possible: ₹2,00,000

**Benefits:**
- Long-term retirement planning
- Tax-efficient savings
- Flexible withdrawal options

Start your NPS account today!`;
      } else if (q.includes('tax') || q.includes('income')) {
        fallbackAnswer = `General Tax Tips:

1. **Understand your regime:** Compare Old and New Regime
2. **Maximize deductions:** Use 80C, 80D, NPS wisely
3. **File on time:** ITR deadline is July 31st
4. **Keep documents:** Maintain receipts for 7 years
5. **Investment planning:** Align with tax-saving goals
6. **Professional help:** Consult a CA for complex situations

Ready to optimize your taxes? 💡`;
      } else {
        fallbackAnswer = `I'm TaxBuddy AI, here to help with tax-related questions in India.

I can assist with:
- Old vs New Tax Regime comparison
- Section 80C deductions
- Health insurance (80D) benefits
- NPS (National Pension Scheme)
- Tax-saving strategies
- ITR filing guidance

Please ask any tax-related question! 📊`;
      }

      res.json({ answer: fallbackAnswer });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to process question: ' + err.message });
  }
};
