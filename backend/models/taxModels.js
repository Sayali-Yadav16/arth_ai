const pool = require('../config/db');

async function saveTaxRecord(user_id, income, deductions, tax_amount) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query(
      'INSERT INTO tax_records (user_id, income, deductions, tax_amount) VALUES (?, ?, ?, ?)',
      [user_id, income, deductions, tax_amount]
    );
    return { id: result.insertId };
  } finally {
    conn.release();
  }
}

async function getTaxRecordsForUser(user_id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id, income, deductions, tax_amount, created_at FROM tax_records WHERE user_id = ? ORDER BY created_at ASC', [user_id]);
    return rows;
  } finally {
    conn.release();
  }
}

module.exports = {
  saveTaxRecord,
  getTaxRecordsForUser
};