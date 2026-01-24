const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();




// ===== DETERMINISTIC TAX CALCULATION (RULE-BASED, NO AI) =====

/**
 * Calculate old regime tax based on FY 2024-25 slabs (for age < 60)
 * Slabs: 0-2.5L (0%), 2.5L-5L (5%), 5L-10L (20%), 10L+ (30%)
 */
function calculateOldRegimeTax(taxableIncome, age) {
  let tax = 0;
  if (taxableIncome > 250000) {
    tax += Math.min(taxableIncome - 250000, 250000) * 0.05;
  }
  if (taxableIncome > 500000) {
    tax += Math.min(taxableIncome - 500000, 500000) * 0.20;
  }
  if (taxableIncome > 1000000) {
    tax += (taxableIncome - 1000000) * 0.30;
  }

  // Senior citizen (60+) gets 5L limit
  if (age >= 60 && taxableIncome <= 500000) {
    tax = 0;
  }
  // Very senior citizen (80+) gets 5L limit
  if (age >= 80 && taxableIncome <= 500000) {
    tax = 0;
  }

  return Math.round(tax);
}

/**
 * Calculate new regime tax based on FY 2024-25 slabs (no deductions)
 * Slabs: 0-3L (0%), 3L-6L (5%), 6L-9L (10%), 9L-12L (15%), 12L-15L (20%), 15L+ (30%)
 */
function calculateNewRegimeTax(income, age) {
  let tax = 0;
  if (income > 300000) {
    tax += Math.min(income - 300000, 300000) * 0.05;
  }
  if (income > 600000) {
    tax += Math.min(income - 600000, 300000) * 0.10;
  }
  if (income > 900000) {
    tax += Math.min(income - 900000, 300000) * 0.15;
  }
  if (income > 1200000) {
    tax += Math.min(income - 1200000, 300000) * 0.20;
  }
  if (income > 1500000) {
    tax += (income - 1500000) * 0.30;
  }

  // Senior citizen (60+) gets standard deduction of 50,000
  if (age >= 60) {
    const adjustedIncome = Math.max(income - 50000, 0);
    tax = 0;
    if (adjustedIncome > 300000) {
      tax += Math.min(adjustedIncome - 300000, 300000) * 0.05;
    }
    if (adjustedIncome > 600000) {
      tax += Math.min(adjustedIncome - 600000, 300000) * 0.10;
    }
    if (adjustedIncome > 900000) {
      tax += Math.min(adjustedIncome - 900000, 300000) * 0.15;
    }
    if (adjustedIncome > 1200000) {
      tax += Math.min(adjustedIncome - 1200000, 300000) * 0.20;
    }
    if (adjustedIncome > 1500000) {
      tax += (adjustedIncome - 1500000) * 0.30;
    }
  }

  return Math.round(tax);
}

/**
 * POST /api/tax/calculate
 * Calculate tax for both regimes
 */
exports.calculateTax = (req, res) => {
  try {
    const { income, age, deduction80C, deduction80D } = req.body;

    // Validation
    if (!income || income < 0) {
      return res.status(400).json({ error: 'Valid income required' });
    }

    const inc = Number(income);
    const ageNum = Number(age) || 0;
    const ded80C = Math.max(0, Math.min(Number(deduction80C) || 0, 150000)); // Max 1.5L
    const ded80D = Math.max(0, Number(deduction80D) || 0); // No hard limit, varies by age

    const totalDeductions = ded80C + ded80D;
    const taxableIncome = Math.max(inc - totalDeductions, 0);

    // OLD REGIME (with deductions)
    const oldTax = calculateOldRegimeTax(taxableIncome, ageNum);

    // NEW REGIME (no deductions on income)
    const newTax = calculateNewRegimeTax(inc, ageNum);

    // Determine better regime
    const betterRegime = oldTax <= newTax ? 'Old Regime' : 'New Regime';
    const taxSavings = Math.abs(oldTax - newTax);

    res.json({
      income: inc,
      age: ageNum,
      deduction80C: ded80C,
      deduction80D: ded80D,
      totalDeductions,
      taxableIncome,
      oldRegimeTax: oldTax,
      newRegimeTax: newTax,
      betterRegime,
      taxSavings,
      effectiveTaxRate: ((oldTax < newTax ? oldTax : newTax) / inc * 100).toFixed(2)
    });
  } catch (err) {
    res.status(500).json({ error: 'Calculation error: ' + err.message });
  }
};

/**
 * POST /api/tax/explain
 * Get AI explanation of tax calculation using Gemini API
 */
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,

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
      // Fallback response if API fails
      const fallbackExplanation = `Based on your income of ₹${income} and deductions of ₹${totalDeductions}, your taxable income is ₹${taxableIncome}. In the ${betterRegime}, you'll pay ₹${Math.min(oldRegimeTax, newRegimeTax)} in tax. This saves you ₹${Math.abs(oldRegimeTax - newRegimeTax)} compared to the alternative regime.`;
      res.json({ explanation: fallbackExplanation });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate explanation: ' + err.message });
  }
};

/**
 * POST /api/tax/suggestions
 * Get AI suggestions for tax savings using Gemini API
 */
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
         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
      // Fallback suggestions if API fails
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

/**
 * POST /api/tax/summary
 * Generate downloadable tax summary using Gemini API
 */
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
         `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    // Generate HTML for download
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
