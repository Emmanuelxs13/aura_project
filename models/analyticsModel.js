const { pool } = require("../config/database");

const AnalyticsModel = {
  async getDashboardMetrics() {
    const { rows: productStats } = await pool.query(`
      SELECT
        COUNT(*)::int as total_products,
        SUM(stock)::int as total_stock,
        COUNT(*) FILTER (WHERE featured = true)::int as featured_count,
        COUNT(*) FILTER (WHERE stock = 0)::int as out_of_stock
      FROM products
    `);

    const { rows: orderStats } = await pool.query(`
      SELECT
        COUNT(*)::int as total_orders,
        COALESCE(SUM(total_amount), 0)::numeric(12,2) as total_revenue,
        COUNT(*) FILTER (WHERE status = 'Pending')::int as pending_orders,
        COUNT(*) FILTER (WHERE status = 'Delivered')::int as delivered_orders
      FROM orders
    `);

    const { rows: userStats } = await pool.query(`
      SELECT COUNT(*)::int as total_users,
        COUNT(*) FILTER (WHERE role = 'Customer')::int as customers
      FROM users
    `);

    return {
      products: productStats[0],
      orders: orderStats[0],
      users: userStats[0],
    };
  },

  async getTopProducts(limit = 5) {
    const { rows } = await pool.query(`
      SELECT
        p.id, p.name, p.slug, p.price, p.stock,
        COALESCE(SUM(oi.quantity), 0)::int as total_sold,
        COALESCE(SUM(oi.line_total), 0)::numeric(12,2) as total_revenue
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY total_sold DESC
      LIMIT $1
    `, [limit]);
    return rows;
  },

  async getSalesByCategory() {
    const { rows } = await pool.query(`
      SELECT
        p.category,
        COUNT(DISTINCT oi.order_id)::int as order_count,
        COALESCE(SUM(oi.quantity), 0)::int as units_sold,
        COALESCE(SUM(oi.line_total), 0)::numeric(12,2) as revenue
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY p.category
      ORDER BY revenue DESC
    `);
    return rows;
  },

  async getMonthlySales() {
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*)::int as order_count,
        SUM(total_amount)::numeric(12,2) as revenue,
        AVG(total_amount)::numeric(12,2) as avg_order_value
      FROM orders
      WHERE status != 'Cancelled'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `);
    return rows;
  },
};

module.exports = AnalyticsModel;
