const { pool } = require("../config/database");

const ProductModel = {
  async findAll({ category, featured, limit, offset, search } = {}) {
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (featured !== undefined) {
      sql += ` AND featured = $${paramIndex++}`;
      params.push(featured);
    }
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR tagline ILIKE $${paramIndex})`;
      paramIndex++;
      params.push(`%${search}%`);
    }
    sql += " ORDER BY created_at DESC";
    if (limit) {
      sql += ` LIMIT $${paramIndex++}`;
      params.push(limit);
    }
    if (offset) {
      sql += ` OFFSET $${paramIndex++}`;
      params.push(offset);
    }

    const { rows } = await pool.query(sql, params);
    return rows;
  },

  async findBySlug(slug) {
    const { rows } = await pool.query("SELECT * FROM products WHERE slug = $1", [slug]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    return rows[0] || null;
  },

  async create(data) {
    const { rows } = await pool.query(
      `INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.name,
        data.slug,
        data.category,
        data.tagline || `${data.category} de alto rendimiento`,
        data.description || `Producto premium de la categoria ${data.category}.`,
        data.price,
        data.compare_at_price || null,
        data.stock || 0,
        data.featured || false,
        data.colorway || "Midnight",
        data.specifications ? JSON.stringify(data.specifications) : null,
      ]
    );
    return rows[0];
  },

  async update(id, data) {
    const fields = [];
    const params = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex++}`);
        if (key === "specifications" && value !== null) {
          params.push(JSON.stringify(value));
        } else {
          params.push(value);
        }
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      params
    );
    return rows[0] || null;
  },

  async delete(id) {
    const { rows } = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id]
    );
    return rows[0] || null;
  },

  async getFeatured() {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE featured = true ORDER BY created_at DESC LIMIT 8"
    );
    return rows;
  },

  async getCategories() {
    const { rows } = await pool.query(
      "SELECT category, COUNT(*)::int as count FROM products GROUP BY category ORDER BY category"
    );
    return rows;
  },
};

module.exports = ProductModel;
