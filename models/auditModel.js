const { pool } = require("../config/database");

async function logAction(actor_id, action, resource, resource_id, details) {
  const sql = `
    INSERT INTO audit_logs (actor_id, action, resource, resource_id, details)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, created_at
  `;

  const values = [
    actor_id || null,
    action,
    resource,
    resource_id || null,
    details || null,
  ];
  const { rows } = await pool.query(sql, values);
  return rows[0];
}

async function list({ limit = 100, offset = 0, q = null } = {}) {
  const where = [];
  const queryText = q && String(q).trim() ? String(q).trim() : null;
  const values = queryText ? new Array(3).fill(`%${queryText}%`) : [];

  if (queryText) {
    where.push(
      `(a.action ILIKE $${values.length - 2} OR a.resource ILIKE $${values.length - 1} OR COALESCE(a.details::text, '') ILIKE $${values.length})`,
    );
  }

  values.push(limit, offset);

  const sql = `
    SELECT a.id, a.actor_id, u.name AS actor_name, a.action, a.resource, a.resource_id, a.details, a.created_at
    FROM audit_logs a
    LEFT JOIN users u ON u.id = a.actor_id
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY a.created_at DESC
    LIMIT $${values.length - 1} OFFSET $${values.length}
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
}

async function count({ q = null } = {}) {
  const where = [];
  const queryText = q && String(q).trim() ? String(q).trim() : null;
  const values = queryText ? new Array(3).fill(`%${queryText}%`) : [];
  if (queryText) {
    where.push(
      `(action ILIKE $${values.length - 2} OR resource ILIKE $${values.length - 1} OR COALESCE(details::text, '') ILIKE $${values.length})`,
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sql = `SELECT COUNT(*) AS total FROM audit_logs ${whereSql}`;
  const { rows } = await pool.query(sql, values);
  return Number(rows[0].total || 0);
}

module.exports = {
  logAction,
  list,
  count,
};
