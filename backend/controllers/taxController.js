const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

/* ---------------- TAX CALCULATION FUNCTIONS (UNCHANGED) ---------------- */

function calculateOldRegimeTax(taxableIncome, age) {
  let tax = 0;
  if (taxableIncome > 250000) tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
  if (taxableIncome > 500000) tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
  if (taxableIncome > 1000000) tax += (taxableIncome - 1000000) * 0.30;

  if (age >= 60 && taxableIncome <= 500000) tax = 0;
  if (age >= 80 && taxableIncome <= 500000) tax = 0;

  return Math.round(tax);
}

function calculateNewRegimeTax(income, age) {
  let tax = 0;

  if (income > 300000) tax += Math.min(income - 300000, 300000) * 0.05;
  if (income > 600000) tax += Math.min(income - 600000, 300000) * 0.10;
  if (income > 900000) tax += Math.min(income - 900000, 300000) * 0.15;
  if (income > 1200000) tax += Math.min(income - 1200000, 300000) * 0.20;
  if (income > 1500000) tax += (income - 1500000) * 0.30;

  return Math.round(tax);
}

/* ---------------- EXISTING CONTROLLERS (UNCHANGED) ---------------- */

exports.calculateTax = (req, res) => {
  try {
    const { income, age, deduction80C, deduction80D } = req.body;

    if (!income || income < 0)
      return res.status(400).json({ error: "Valid income required" });

    const inc = Number(income);
    const ageNum = Number(age) || 0;

    const ded80C = Math.max(0, Math.min(Number(deduction80C) || 0, 150000));
    const ded80D = Math.max(0, Number(deduction80D) || 0);

    const totalDeductions = ded80C + ded80D;
    const taxableIncome = Math.max(inc - totalDeductions, 0);

    const oldTax = calculateOldRegimeTax(taxableIncome, ageNum);
    const newTax = calculateNewRegimeTax(inc, ageNum);

    const betterRegime = oldTax <= newTax ? "Old Regime" : "New Regime";
    const taxSavings = Math.abs(oldTax - newTax);

    res.json({
      income: inc,
      age: ageNum,
      totalDeductions,
      taxableIncome,
      oldRegimeTax: oldTax,
      newRegimeTax: newTax,
      betterRegime,
      taxSavings
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------- AI DOCUMENT ANALYSIS (UPDATED) ---------------- */

exports.analyzeTax = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    let text = "";

    /* ----------- TEXT EXTRACTION ----------- */

    if (req.file.mimetype === "application/pdf") {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        // handle both commonjs and ES default exports
        const ParserClass = pdfParse.PDFParse || (pdfParse.default && pdfParse.default.PDFParse) || pdfParse;

        if (typeof ParserClass === 'function' && ParserClass.prototype && ParserClass.prototype.getText) {
          const parser = new ParserClass({ data: fileBuffer });
          const data = await parser.getText();
          text = data.text;
        } else if (typeof pdfParse === 'function') {
          const data = await pdfParse(fileBuffer);
          text = data.text;
        } else if (pdfParse.default && typeof pdfParse.default === 'function') {
          const data = await pdfParse.default(fileBuffer);
          text = data.text;
        } else {
          throw new Error('Could not find a valid PDF parsing method in pdf-parse module');
        }
      } catch (parseError) {
        console.error("PDF Parse Error:", parseError);
        throw new Error("Failed to parse PDF: " + parseError.message);
      }
    }

    else if (req.file.mimetype.includes("word")) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    }

    else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: "Unsupported file type" });
    }

    fs.unlinkSync(filePath); // delete file after reading

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: "Could not extract meaningful text" });
    }

    /* ----------- GEMINI PROMPT ----------- */

    const prompt = `
You are an Indian tax expert.

Analyze this tax document and extract:

- Salary / Income
- TDS deducted
- Deductions (80C, 80D, etc.)
- Taxable income
- Missing tax saving opportunities
- Personalized tax saving tips

Document content:
${text}
`;

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const aiText =
      response.data.candidates[0].content.parts[0].text;

    res.json({
      summary: aiText
    });

  } catch (err) {
    console.error("Analyze Tax Error:", err.response?.data || err.message);
    res.status(500).json({ error: "AI analysis failed: " + (err.response?.data?.error?.message || err.message) });
  }
};

// additional AI-based endpoints moved from legacy controller

exports.explainTax = async (req, res) => {
  try {
    const { income, totalDeductions, taxableIncome, oldRegimeTax, newRegimeTax, betterRegime } = req.body;

    if (!income || !betterRegime) {
      return res.status(400).json({ error: 'Missing calculation data' });
    }

    const prompt = `You are a friendly tax expert. Explain this tax calculation in simple, non-technical language (under 200 words):

Income: ₹${income}
Total Deductions (80C + 80D): ₹${totalDeductions}
Taxable Income: ₹${taxableIncome}
Tax in Old Regime: ₹${oldRegimeTax}
Tax in New Regime: ₹${newRegimeTax}
Better Option: ${betterRegime}

Explain:
1. How deductions reduced taxable income
2. Why ${betterRegime} is better
3. Final tax they'll pay
Keep it conversational and encouraging.`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

      const explanation = response.data.candidates[0].content.parts[0].text;
      res.json({ explanation });
    } catch (apiErr) {
      console.error('Gemini API Error:', apiErr.response?.data || apiErr.message);
      const fallbackExplanation = `Based on your income of ₹${income} and deductions of ₹${totalDeductions}, your taxable income is ₹${taxableIncome}. In the ${betterRegime}, you'll pay ₹${Math.min(oldRegimeTax, newRegimeTax)} in tax. This saves you ₹${Math.abs(oldRegimeTax - newRegimeTax)} compared to the alternative regime.`;
      res.json({ explanation: fallbackExplanation });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate explanation: ' + err.message });
  }
};

exports.getTaxSuggestions = async (req, res) => {
  try {
    const { income, age, currentDeductions80C, currentDeductions80D } = req.body;

    if (!income) {
      return res.status(400).json({ error: 'Income required' });
    }

    const ageNum = Number(age) || 0;
    const ded80C = Number(currentDeductions80C) || 0;
    const ded80D = Number(currentDeductions80D) || 0;

    const prompt = `You are a friendly tax advisor. Based on this income profile, suggest legal tax-saving options (under 150 words):

Annual Income: ₹${income}
Age: ${ageNum}
Current 80C Deductions: ₹${ded80C}
Current 80D Health Insurance: ₹${ded80D}

Suggest practical ways to maximize:
1. Section 80C (max ₹1,50,000) - Life insurance, ELSS, EPF, etc.
2. Section 80D (health insurance) - Depends on age
3. NPS (National Pension Scheme) - Additional tax benefit

Be specific and actionable. Don't calculate tax, just suggest options.`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

      const suggestions = response.data.candidates[0].content.parts[0].text;
      res.json({ suggestions });
    } catch (apiErr) {
      console.error('Gemini API Error:', apiErr.response?.data || apiErr.message);
      const fallbackSuggestions = `To maximize tax savings:
1. Max out your 80C deductions (₹1,50,000) through ELSS, PPF, life insurance, or NPS
2. Get adequate health insurance (80D) - premium amount is deductible
3. For NPS, you get an additional ₹50,000 deduction under 80CCD(1B)
4. Keep all investment receipts for 7 years for record-keeping`;
      res.json({ suggestions: fallbackSuggestions });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate suggestions: ' + err.message });
  }
};

exports.generateTaxSummary = async (req, res) => {
  try {
    const { income, totalDeductions, taxableIncome, oldRegimeTax, newRegimeTax, betterRegime, selectedRegime } = req.body;

    if (!income || !betterRegime) {
      return res.status(400).json({ error: 'Missing calculation data' });
    }

    const finalTax = selectedRegime === 'Old Regime' ? oldRegimeTax : newRegimeTax;
    const taxSavings = Math.abs(oldRegimeTax - newRegimeTax);

    const prompt = `You are a tax professional. Generate a brief tax summary (under 150 words) for:

Income: ₹${income}
Deductions: ₹${totalDeductions}
Taxable Income: ₹${taxableIncome}
Selected Regime: ${selectedRegime}
Tax Amount: ₹${finalTax}

Provide a summary in formal, professional language suitable for documentation.
Include key takeaways and filing recommendations.`;

    let summary = `Based on an annual income of ₹${income} with deductions of ₹${totalDeductions}, the taxable income is ₹${taxableIncome}. Under the ${selectedRegime}, the total tax payable is ₹${finalTax}, resulting in tax savings of ₹${taxSavings} compared to the alternative regime.`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }]
        },
        { timeout: 10000 }
      );

      if (response.data.candidates && response.data.candidates[0]) {
        summary = response.data.candidates[0].content.parts[0].text;
      }
    } catch (apiErr) {
      console.error('Gemini API Error (using fallback):', apiErr.message);
      // Use fallback summary above
    }

    // generate html document
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Tax Summary - TaxBuddy</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
    .header h1 { color: #007bff; }
    .section { margin: 30px 0; }
    .section h2 { color: #007bff; border-left: 4px solid #007bff; padding-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    table tr { border-bottom: 1px solid #ddd; }
    table td { padding: 10px; }
    table .label { font-weight: bold; width: 40%; }
    .highlight { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 TaxBuddy Tax Summary Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
  </div>

  <div class="section">
    <h2>Income & Deductions</h2>
    <table>
      <tr>
        <td class="label">Annual Income:</td>
        <td>₹${income.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="label">Total Deductions (80C + 80D):</td>
        <td>₹${totalDeductions.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="label">Taxable Income:</td>
        <td>₹${taxableIncome.toLocaleString('en-IN')}</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>Tax Calculation</h2>
    <table>
      <tr>
        <td class="label">Tax in Old Regime:</td>
        <td>₹${oldRegimeTax.toLocaleString('en-IN')}</td>
      </tr>
      <tr>
        <td class="label">Tax in New Regime:</td>
        <td>₹${newRegimeTax.toLocaleString('en-IN')}</td>
      </tr>
      <tr style="background: #f0f0f0;">
        <td class="label"><strong>Your Tax (${selectedRegime}):</strong></td>
        <td><strong>₹${finalTax.toLocaleString('en-IN')}</strong></td>
      </tr>
      <tr style="background: #e7f3ff;">
        <td class="label"><strong>Tax Savings:</strong></td>
        <td><strong>₹${taxSavings.toLocaleString('en-IN')}</strong></td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>Summary</h2>
    <div class="highlight">
      ${summary}
    </div>
  </div>

  <div class="section">
    <h2>Recommendations</h2>
    <ul>
      <li>File your ITR before the due date (July 31st for salaried individuals)</li>
      <li>Maintain supporting documents for all deductions claimed</li>
      <li>Keep copies of investment receipts, insurance policies, and medical bills</li>
      <li>Update your PAN and address in the Income Tax portal</li>
      <li>Ensure Form 16 is issued by your employer with correct TDS details</li>
    </ul>
  </div>

  <div class="footer">
    <p>This is an automated tax summary from TaxBuddy. For professional tax advice, consult a qualified CA.</p>
    <p>Disclaimer: This tool provides general information only and not legal or financial advice.</p>
  </div>
</body>
</html>
    `;
    res.json({ htmlContent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate summary: ' + err.message });
  }
};