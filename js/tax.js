// Get API base URL
// Get API base URL
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:4000/api'
  : '/api';
const token = localStorage.getItem('tb_token');


let currentCalculation = null;

let calculatedTaxData = {};

document.addEventListener('DOMContentLoaded', () => {
  // Form and elements
  const taxForm = document.getElementById('taxForm');
  const breakdownSection = document.getElementById('breakdownSection');
  const comparisonPreview = document.getElementById('comparisonPreview');
  const quickComparison = document.getElementById('quickComparison');
  const messages = document.getElementById('messages');

  if (!taxForm) {
    console.error('Tax form not found');
    return;
  }

  // Handle form submission
  taxForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const income = Number(document.getElementById('income').value);
    const age = Number(document.getElementById('age').value) || 0;
    const deduction80C = Number(document.getElementById('deduction80C').value) || 0;
    const deduction80D = Number(document.getElementById('deduction80D').value) || 0;

    try {
      const response = await fetch(`${API_URL}/tax/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + localStorage.getItem("tb_token")
        },
        body: JSON.stringify({
          income,
          age,
          deduction80C,
          deduction80D
        })
      });

      if (!response.ok) {
        throw new Error('Calculation failed');
      }

      const data = await response.json();
      currentCalculation = data;

      // Display results
      displayBreakdown(data);
      displayComparison(data);

      // Show breakdown section
      breakdownSection.classList.add('active');

      // Scroll to results
      breakdownSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      showMessage('Error calculating tax: ' + error.message, 'error');
    }
  });

  // Display quick comparison preview
  function displayComparison(data) {
    document.getElementById('previewOldTax').textContent = '₹' + data.oldRegimeTax.toLocaleString();
    document.getElementById('previewNewTax').textContent = '₹' + data.newRegimeTax.toLocaleString();
    document.getElementById('previewSavings').textContent = '₹' + data.taxSavings.toLocaleString();
    document.getElementById('betterRecommendation').textContent = `✓ ${data.betterRegime} is better for you`;

    quickComparison.style.display = 'none';
    comparisonPreview.style.display = 'block';
  }

  // Display detailed breakdown
  function displayBreakdown(data) {
    // Income and deductions
    document.getElementById('bd-income').textContent = '₹' + data.income.toLocaleString();
    document.getElementById('bd-ded80C').textContent = '₹' + data.deduction80C.toLocaleString();
    document.getElementById('bd-ded80D').textContent = '₹' + data.deduction80D.toLocaleString();
    document.getElementById('bd-totalDed').textContent = '₹' + data.totalDeductions.toLocaleString();
    document.getElementById('bd-taxable').textContent = '₹' + data.taxableIncome.toLocaleString();

    // Tax comparison
    document.getElementById('bd-oldTax').textContent = '₹' + data.oldRegimeTax.toLocaleString();
    document.getElementById('bd-newTax').textContent = '₹' + data.newRegimeTax.toLocaleString();
    document.getElementById('bd-savings').textContent = '₹' + data.taxSavings.toLocaleString();

    // Highlight better regime
    const oldCard = document.getElementById('oldRegimeCard');
    const newCard = document.getElementById('newRegimeCard');
    oldCard.classList.remove('better');
    newCard.classList.remove('better');

    if (data.betterRegime === 'Old Regime') {
      oldCard.classList.add('better');
    } else {
      newCard.classList.add('better');
    }

    // Recommendation
    const effectiveTax = Math.min(data.oldRegimeTax, data.newRegimeTax);
    const effectiveRate = ((effectiveTax / data.income) * 100).toFixed(2);

    document.getElementById('bd-recommendation').innerHTML = `
      ${data.betterRegime} will save you <strong>₹${data.taxSavings.toLocaleString()}</strong><br>
      Your effective tax rate: <strong>${effectiveRate}%</strong>
    `;

    // Enable AI buttons
    document.getElementById('explainBtn').disabled = false;
    document.getElementById('suggestBtn').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
  }

  // Show message
  function showMessage(text, type = 'error') {
    const div = document.createElement('div');
    div.className = type;
    div.textContent = text;
    messages.innerHTML = '';
    messages.appendChild(div);
    setTimeout(() => {
      div.remove();
    }, 5000);
  }

  // EXPLAIN TAX - AI Feature
  const explainBtn = document.getElementById('explainBtn');
  if (explainBtn) {
    explainBtn.addEventListener('click', async () => {
      if (!currentCalculation) return;

      const btn = document.getElementById('explainBtn');
      btn.disabled = true;
      btn.innerHTML = '<span style="display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #4f46e5; border-radius: 50%; animation: spin 0.8s linear infinite;"></span> Loading...';

      try {
        const response = await fetch(`${API_URL}/tax/explain`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            income: currentCalculation.income,
            totalDeductions: currentCalculation.totalDeductions,
            taxableIncome: currentCalculation.taxableIncome,
            oldRegimeTax: currentCalculation.oldRegimeTax,
            newRegimeTax: currentCalculation.newRegimeTax,
            betterRegime: currentCalculation.betterRegime
          })
        });

        if (!response.ok) throw new Error('Failed to generate explanation');

        const data = await response.json();

        document.getElementById('explanationContent').innerHTML = data.explanation.replace(/\n/g, '<br>');
        document.getElementById('aiExplanation').style.display = 'block';
      } catch (error) {
        showMessage('Error generating explanation: ' + error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>🤖 Explain My Tax</span>';
      }
    });
  }

  // TAX SAVING SUGGESTIONS - AI Feature
  const suggestBtn = document.getElementById('suggestBtn');
  if (suggestBtn) {
    suggestBtn.addEventListener('click', async () => {
      if (!currentCalculation) return;

      const btn = document.getElementById('suggestBtn');
      btn.disabled = true;
      btn.innerHTML = '<span style="display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #4f46e5; border-radius: 50%; animation: spin 0.8s linear infinite;"></span> Loading...';

      try {
        const response = await fetch(`${API_URL}/tax/suggestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            income: currentCalculation.income,
            age: document.getElementById('age').value,
            currentDeductions80C: currentCalculation.deduction80C,
            currentDeductions80D: currentCalculation.deduction80D
          })
        });

        if (!response.ok) throw new Error('Failed to generate suggestions');

        const data = await response.json();

        document.getElementById('suggestionsContent').innerHTML = data.suggestions.replace(/\n/g, '<br>');
        document.getElementById('aiSuggestions').style.display = 'block';
      } catch (error) {
        showMessage('Error generating suggestions: ' + error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>💡 Tax Saving Tips</span>';
      }
    });
  }

  // DOWNLOAD SUMMARY - PDF Generation
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      if (!currentCalculation) return;

      const btn = document.getElementById('downloadBtn');
      btn.disabled = true;
      btn.innerHTML = '<span style="display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #4f46e5; border-radius: 50%; animation: spin 0.8s linear infinite;"></span> Generating...';

      try {
        // Determine selected regime (the better one)
        const selectedRegime = currentCalculation.betterRegime;

        const response = await fetch(`${API_URL}/tax/summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            income: currentCalculation.income,
            totalDeductions: currentCalculation.totalDeductions,
            taxableIncome: currentCalculation.taxableIncome,
            oldRegimeTax: currentCalculation.oldRegimeTax,
            newRegimeTax: currentCalculation.newRegimeTax,
            betterRegime: currentCalculation.betterRegime,
            selectedRegime: selectedRegime
          })
        });

        if (!response.ok) throw new Error('Failed to generate summary');

        const data = await response.json();

        // Open HTML in new tab
        const blob = new Blob([data.htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tax-summary-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showMessage('Tax summary downloaded successfully!', 'success');
      } catch (error) {
        showMessage('Error generating summary: ' + error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>📥 Download Summary</span>';
      }
    });
  }

  // Disable AI buttons initially
  const explainBtnInit = document.getElementById('explainBtn');
  const suggestBtnInit = document.getElementById('suggestBtn');
  const downloadBtnInit = document.getElementById('downloadBtn');

  if (explainBtnInit) explainBtnInit.disabled = true;
  if (suggestBtnInit) suggestBtnInit.disabled = true;
  if (downloadBtnInit) downloadBtnInit.disabled = true;
}); // Close DOMContentLoaded