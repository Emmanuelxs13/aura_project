const { pool } = require("../config/database");

const UserModel = {
  async findByEmail(email) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      "SELECT id, name, email, role, status, created_at, updated_at FROM users WHERE id = $1",
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, email, password_hash, role = "Customer" }) {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, 'Active')
       RETURNING id, name, email, role, status, created_at`,
      [name, email, password_hash, role]
    );
    return rows[0];
  },

  async findAll({ page = 1, pageSize = 20 } = {}) {
    const offset = (page - 1) * pageSize;
    const { rows } = await pool.query(
      "SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [pageSize, offset]
    );
    const { rows: countRows } = await pool.query("SELECT COUNT(*)::int as total FROM users");
    return { users: rows, total: countRows[0].total };
  },

  async updateRole(id, role) {
    const { rows } = await pool.query(
      "UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role, status",
      [role, id]
    );
    return rows[0] || null;
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      "UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, email, role, status",
      [status, id]
    );
    return rows[0] || null;
  },

  async getCountByRole() {
    const { rows } = await pool.query(
      "SELECT role, COUNT(*)::int as count FROM users GROUP BY role ORDER BY role"
    );
    return rows;
  },
};

module.exports = UserModel;
