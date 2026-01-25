const token = localStorage.getItem('tb_token');
if (!token) window.location.href = 'login.html';

function savePlan(plan) {
  // Simple local save — in production, persist to backend
  const plans = JSON.parse(localStorage.getItem('tb_plans') || '[]');
  plans.push({ plan, savedAt: new Date().toISOString() });
  localStorage.setItem('tb_plans', JSON.stringify(plans));
  document.getElementById('save-msg').textContent = `Saved plan: ${plan}`;
}