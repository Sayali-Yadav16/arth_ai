// Simple user model using raw queries (mysql2)
const pool = require('../config/db');

async function createUser(name, email, hashedPassword) {
  const conn = await pool.getConnection();
  try {
    const [result] = await conn.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    return { id: result.insertId, name, email };
  } finally {
    conn.release();
  }
}

async function findUserByEmail(email) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0];
  } finally {
    conn.release();
  }
}

async function findUserById(id) {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0];
  } finally {
    conn.release();
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById
};