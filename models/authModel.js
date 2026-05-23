const { pool } = require("../config/database");
const { hashPassword } = require("../lib/security");

async function findUserByEmail(email) {
  const { rows } = await pool.query(
    `
      SELECT id, name, email, password_hash, role, status
      FROM users
      WHERE lower(email) = lower($1)
      LIMIT 1
    `,
    [email],
  );

  return rows[0] || null;
}

async function findUserById(id) {
  const { rows } = await pool.query(
    `
      SELECT id, name, email, role, status
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function createUser({ name, email, role, status, password }) {
  const passwordHash = hashPassword(password);
  const { rows } = await pool.query(
    `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, role, status, created_at
    `,
    [name, email, passwordHash, role, status],
  );
  return rows[0];
}

async function updateUserRole(userId, role) {
  const { rows } = await pool.query(
    `
      UPDATE users
      SET role = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email, role, status
    `,
    [userId, role],
  );
  return rows[0] || null;
}

async function updateUserStatus(userId, status) {
  const { rows } = await pool.query(
    `
      UPDATE users
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, email, role, status
    `,
    [userId, status],
  );
  return rows[0] || null;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserRole,
  updateUserStatus,
};
