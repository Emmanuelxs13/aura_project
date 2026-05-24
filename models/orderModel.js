const { pool } = require("../config/database");

const OrderModel = {
  async create({ user_id, total_amount, shipping_name, shipping_email, shipping_address, items }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `INSERT INTO orders (user_id, total_amount, shipping_name, shipping_email, shipping_address)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, total_amount, shipping_name, shipping_email, shipping_address]
      );
      const order = rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
           VALUES ($1, $2, $3, $4, $5)`,
          [order.id, item.product_id, item.quantity, item.unit_price, item.line_total]
        );
      }

      await client.query("COMMIT");
      return order;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async findById(id) {
    const { rows } = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
    if (!rows.length) return null;

    const { rows: items } = await pool.query(
      `SELECT oi.*, p.name, p.slug
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );
    return { ...rows[0], items };
  },

  async findByUser(userId, { page = 1, pageSize = 20 } = {}) {
    const offset = (page - 1) * pageSize;
    const { rows } = await pool.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
      [userId, pageSize, offset]
    );
    const { rows: countRows } = await pool.query(
      "SELECT COUNT(*)::int as total FROM orders WHERE user_id = $1",
      [userId]
    );
    return { orders: rows, total: countRows[0].total };
  },

  async findAll({ page = 1, pageSize = 20, status } = {}) {
    let sql = "SELECT * FROM orders WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    sql += " ORDER BY created_at DESC";
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(pageSize, (page - 1) * pageSize);

    const { rows } = await pool.query(sql, params);

    let countSql = "SELECT COUNT(*)::int as total FROM orders WHERE 1=1";
    const countParams = [];
    if (status) {
      countSql += " AND status = $1";
      countParams.push(status);
    }
    const { rows: countRows } = await pool.query(countSql, countParams);

    return { orders: rows, total: countRows[0].total };
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, id]
    );
    return rows[0] || null;
  },

  async getMonthlySales() {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*)::int as order_count,
        SUM(total_amount)::numeric(12,2) as revenue
      FROM orders
      WHERE status != 'Cancelled'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `);
    return rows;
  },

  async getStatusSummary() {
    const { rows } = await pool.query(`
      SELECT status, COUNT(*)::int as count, SUM(total_amount)::numeric(12,2) as total
      FROM orders GROUP BY status ORDER BY status
    `);
    return rows;
  },
};

module.exports = OrderModel;
