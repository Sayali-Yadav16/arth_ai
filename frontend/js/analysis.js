const API_BASE = 'http://localhost:4000/api/analysis';

const token = localStorage.getItem('tb_token');
if (!token) window.location.href = 'login.html';

async function loadAnalysis() {
  try {
    const resp = await fetch(`${API_BASE}/tax/analysis`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Failed to fetch');
    const map = new Map();
    data.data.forEach(d => {
      const y = d.year;
      if (!map.has(y)) map.set(y, { income:0, tax:0 });
      const cur = map.get(y);
      cur.income += d.income;
      cur.tax += d.tax;
    });
    const years = Array.from(map.keys());
    const incomes = years.map(y => map.get(y).income);
    const taxes = years.map(y => map.get(y).tax);

    const ctx = document.getElementById('analysisChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          { label: 'Income', data: incomes, borderColor: 'rgba(75,192,192,1)', fill:false },
          { label: 'Tax', data: taxes, borderColor: 'rgba(153,102,255,1)', fill:false }
        ]
      },
      options: { responsive:true, maintainAspectRatio:false }
    });
  } catch (err) {
    console.error(err);
  }
}
loadAnalysis();