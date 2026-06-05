export {};
const pool = require("../config/db");

async function getAllUsers() {
  const result = await pool.query("SELECT id, name, email, role FROM users ORDER BY id");
  return result.rows;
}

async function getUserById(id: number) {
  const result = await pool.query("SELECT id, name, email, role FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function createUser(user: { name: string; email: string; password: string; role: string }) {
  const result = await pool.query(
    "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
    [user.name, user.email, user.password, user.role]
  );
  return result.rows[0];
}

async function updateUser(id: number, updates: { name?: string; email?: string; password?: string; role?: string }) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex}`);
    values.push(updates.name);
    paramIndex++;
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex}`);
    values.push(updates.email);
    paramIndex++;
  }
  if (updates.password !== undefined) {
    fields.push(`password = $${paramIndex}`);
    values.push(updates.password);
    paramIndex++;
  }
  if (updates.role !== undefined) {
    fields.push(`role = $${paramIndex}`);
    values.push(updates.role);
    paramIndex++;
  }

  if (fields.length === 0) return null;

  values.push(id);
  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING id, name, email, role`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

async function deleteUser(id: number) {
  const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id, name, email, role", [id]);
  return result.rows[0] || null;
}

async function getUserByEmailAndPassword(email: string, password: string) {
  const result = await pool.query("SELECT id, name, email, role FROM users WHERE email = $1 AND password = $2", [
    email,
    password
  ]);
  return result.rows[0] || null;
}

async function getUserByEmail(email: string) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] || null;
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmailAndPassword,
  getUserByEmail
};
