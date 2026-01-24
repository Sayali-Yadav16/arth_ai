/**
 * Global logout function
 * Clears user session and redirects to login
 */
function logout() {
  localStorage.removeItem('tb_token');
  localStorage.removeItem('tb_user');
  localStorage.removeItem('tb_lastCalculation');
  
  window.location.href = 'login.html';
}
