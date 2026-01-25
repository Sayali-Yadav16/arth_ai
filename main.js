const ctx = document.getElementById('taxChart');

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['0L','5L','10L','15L','20L','25L'],
    datasets: [{
      label: 'Tax Payable',
      data: [0, 20000, 85000, 160000, 260000, 380000],
      borderColor: '#7c6cff',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(124,108,255,0.15)'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { ticks: { color: '#a3a7c3' } },
      y: { ticks: { color: '#a3a7c3' } }
    }
  }
});
