const API_URL = 'http://localhost:4000/api';

// Don't call AI endpoints on page load. Attach handlers so calls happen only on user clicks.
document.addEventListener('DOMContentLoaded', () => {
  const explainBtn = document.getElementById('explainBtnDashboard');
  const suggestBtn = document.getElementById('suggestBtnDashboard');

  if (explainBtn) explainBtn.addEventListener('click', explainTax);
  if (suggestBtn) suggestBtn.addEventListener('click', taxSaving);

  // Try to load last calculation summary from localStorage for display (optional)
  try {
    const last = localStorage.getItem('tb_lastCalculation');
    if (last) {
      const data = JSON.parse(last);
      document.getElementById('income').innerText = `₹${data.income}`;
      document.getElementById('taxable').innerText = `₹${data.taxableIncome}`;
      document.getElementById('oldTax').innerText = `₹${data.oldRegimeTax}`;
      document.getElementById('newTax').innerText = `₹${data.newRegimeTax}`;
      document.getElementById('better').innerText = data.betterRegime;
      document.getElementById('savings').innerText = `₹${data.taxSavings}`;
    }
  } catch (e) {
    // ignore parse errors
  }
});

async function explainTax() {
  const output = document.getElementById('aiOutput');
  output.innerText = '';

  const stored = localStorage.getItem('tb_lastCalculation');
  if (!stored) {
    output.innerText = 'Please run a tax calculation first on Tax Calculator.';
    return;
  }

  const taxData = JSON.parse(stored);

  try {
    const res = await fetch(`${API_URL}/tax/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('tb_token')}` },
      body: JSON.stringify(taxData)
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    output.innerText = data.explanation || 'No explanation returned.';
  } catch (err) {
    output.innerText = 'Error generating explanation: ' + err.message;
  }
}

async function taxSaving() {
  const output = document.getElementById('aiOutput');
  output.innerText = '';

  const stored = localStorage.getItem('tb_lastCalculation');
  if (!stored) {
    output.innerText = 'Please run a tax calculation first on Tax Calculator.';
    return;
  }

  const taxData = JSON.parse(stored);

  try {
    const res = await fetch(`${API_URL}/tax/suggestions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('tb_token')}` },
      body: JSON.stringify({ income: taxData.income, age: taxData.age, currentDeductions80C: taxData.deduction80C, currentDeductions80D: taxData.deduction80D })
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    output.innerText = data.suggestions || 'No suggestions returned.';
  } catch (err) {
    output.innerText = 'Error generating suggestions: ' + err.message;
  }
}
