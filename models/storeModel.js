const { pool } = require("../config/database");

async function safeQuery(queryText, values = [], fallbackRows = []) {
  try {
    const { rows } = await pool.query(queryText, values);
    return rows;
  } catch (error) {
    if (error.code === "42P01") {
      return fallbackRows;
    }

    throw error;
  }
}

function buildCatalogWhere({ category = "", featuredOnly = false } = {}) {
  const clauses = [];
  const values = [];

  if (category) {
    values.push(category);
    clauses.push(`category = $${values.length}`);
  }

  if (featuredOnly) {
    clauses.push(`featured = TRUE`);
  }

  return { clauses, values };
}

async function getProducts({
  category = "",
  search = "",
  featuredOnly = false,
} = {}) {
  const { clauses, values } = buildCatalogWhere({
    category,
    featuredOnly,
  });
  let sql = `
    SELECT
      id,
      name,
      slug,
      category,
      tagline,
      description,
      price,
      compare_at_price,
      stock,
      featured,
      colorway,
      specifications,
      created_at
    FROM products
  `;

  if (clauses.length > 0) {
    sql += ` WHERE ${clauses.join(" AND ")}`;
  }

  sql += ` ORDER BY featured DESC, created_at DESC, id DESC`;
  const { rows } = await pool.query(sql, values);

  if (!search) {
    return rows;
  }

  return rankProducts(rows, search).map(({ product }) => product);
}

async function getFeaturedProducts(limit = 4) {
  const rows = await safeQuery(
    `
      SELECT id, name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications
      FROM products
      WHERE featured = TRUE
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit],
  );
  return rows;
}

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function levenshteinDistance(left, right) {
  const leftText = normalizeSearchText(left);
  const rightText = normalizeSearchText(right);

  if (leftText === rightText) {
    return 0;
  }

  if (!leftText.length) {
    return rightText.length;
  }

  if (!rightText.length) {
    return leftText.length;
  }

  let previousRow = Array.from(
    { length: rightText.length + 1 },
    (_, index) => index,
  );

  for (let leftIndex = 1; leftIndex <= leftText.length; leftIndex += 1) {
    const currentRow = [leftIndex];

    for (let rightIndex = 1; rightIndex <= rightText.length; rightIndex += 1) {
      const insertionCost = currentRow[rightIndex - 1] + 1;
      const deletionCost = previousRow[rightIndex] + 1;
      const substitutionCost =
        previousRow[rightIndex - 1] +
        (leftText[leftIndex - 1] === rightText[rightIndex - 1] ? 0 : 1);

      currentRow.push(Math.min(insertionCost, deletionCost, substitutionCost));
    }

    previousRow = currentRow;
  }

  return previousRow[rightText.length];
}

function scoreProductForQuery(product, query) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const name = normalizeSearchText(product.name);
  const tagline = normalizeSearchText(product.tagline);
  const description = normalizeSearchText(product.description);
  const category = normalizeSearchText(product.category);
  const colorway = normalizeSearchText(product.colorway);
  const specifications = normalizeSearchText(
    JSON.stringify(product.specifications || {}),
  );
  const searchableText = [
    name,
    tagline,
    description,
    category,
    colorway,
    specifications,
  ].join(" ");
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const nameTokens = name.split(/[^a-z0-9]+/).filter(Boolean);

  let score = 0;

  if (name.startsWith(normalizedQuery)) {
    score += 50;
  }

  if (searchableText.includes(normalizedQuery)) {
    score += 30;
  }

  for (const token of tokens) {
    if (!token) {
      continue;
    }

    if (name.includes(token)) {
      score += 10;
    }

    if (searchableText.includes(token)) {
      score += 6;
    }

    const closestDistance = nameTokens.reduce((best, nameToken) => {
      return Math.min(best, levenshteinDistance(nameToken, token));
    }, Number.POSITIVE_INFINITY);

    if (closestDistance === 0) {
      score += 12;
    } else if (closestDistance === 1) {
      score += 8;
    } else if (closestDistance === 2) {
      score += 4;
    }
  }

  if (product.featured) {
    score += 3;
  }

  return score;
}

function rankProducts(products, query, limit = products.length) {
  return products
    .map((product) => ({
      product,
      score: scoreProductForQuery(product, query),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.product.featured !== right.product.featured) {
        return Number(right.product.featured) - Number(left.product.featured);
      }

      return (
        new Date(right.product.created_at || 0) -
        new Date(left.product.created_at || 0)
      );
    })
    .slice(0, limit);
}

async function getSuggestedProducts(query, limit = 6) {
  const rows = await safeQuery(
    `
      SELECT id, name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications, created_at
      FROM products
      ORDER BY featured DESC, created_at DESC, id DESC
    `,
  );

  if (!query || !String(query).trim()) {
    return rows.slice(0, limit);
  }

  return rankProducts(rows, query, limit).map(({ product }) => product);
}

async function getProductBySlug(slug) {
  const rows = await safeQuery(
    `
      SELECT id, name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications, created_at
      FROM products
      WHERE slug = $1
      LIMIT 1
    `,
    [slug],
  );
  return rows[0] || null;
}

async function getProductsByIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return [];
  }

  const rows = await safeQuery(
    `
      SELECT id, name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications
      FROM products
      WHERE id = ANY($1::int[])
    `,
    [ids],
  );

  return rows;
}

function normalizeProductPayload(product) {
  const name = String(product.name || product.model_name || "").trim();
  const baseSlug = String(product.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const generatedSlug =
    baseSlug ||
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  return {
    name,
    slug: generatedSlug,
    category: String(product.category || "").trim(),
    tagline: String(product.tagline || product.hero_note || "").trim(),
    description: String(product.description || "").trim(),
    price: Number(product.price ?? product.purchase_price),
    compare_at_price:
      product.compare_at_price === undefined ||
      product.compare_at_price === null ||
      product.compare_at_price === ""
        ? null
        : Number(product.compare_at_price),
    stock: Number(product.stock ?? 0),
    featured: Boolean(product.featured),
    colorway: String(product.colorway || product.finish || "Midnight").trim(),
    specifications: product.specifications || null,
  };
}

async function createProductRecord(product) {
  const payload = normalizeProductPayload(product);
  const { rows } = await pool.query(
    `
      INSERT INTO products (
        name,
        slug,
        category,
        tagline,
        description,
        price,
        compare_at_price,
        stock,
        featured,
        colorway,
        specifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, slug
    `,
    [
      payload.name,
      payload.slug,
      payload.category,
      payload.tagline,
      payload.description,
      payload.price,
      payload.compare_at_price,
      payload.stock,
      payload.featured,
      payload.colorway,
      payload.specifications,
    ],
  );

  return rows[0];
}

async function createOrderFromCart({
  userId,
  shippingName,
  shippingEmail,
  shippingAddress,
  items,
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productIds = items.map((item) => Number(item.product.id));
    const lockedProducts = await client.query(
      `
        SELECT id, stock, price, name
        FROM products
        WHERE id = ANY($1::int[])
        FOR UPDATE
      `,
      [productIds],
    );
    const productMap = new Map(
      lockedProducts.rows.map((product) => [product.id, product]),
    );

    const unavailableItems = items.filter((item) => {
      const product = productMap.get(Number(item.product.id));
      return !product || product.stock < item.quantity;
    });

    if (unavailableItems.length > 0) {
      const error = new Error(
        "No hay stock suficiente para uno o mas productos.",
      );
      error.code = "OUT_OF_STOCK";
      error.detail = unavailableItems
        .map((item) => item.product.name)
        .join(", ");
      throw error;
    }

    const totals = items.reduce(
      (accumulator, item) => {
        accumulator.total += item.lineTotal;
        accumulator.quantity += item.quantity;
        return accumulator;
      },
      { total: 0, quantity: 0 },
    );

    const orderResult = await client.query(
      `
        INSERT INTO orders (user_id, status, total_amount, shipping_name, shipping_email, shipping_address)
        VALUES ($1, 'Paid', $2, $3, $4, $5)
        RETURNING id, total_amount, created_at
      `,
      [
        userId ?? null,
        totals.total,
        shippingName,
        shippingEmail,
        shippingAddress,
      ],
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          order.id,
          item.product.id,
          item.quantity,
          item.product.price,
          item.lineTotal,
        ],
      );

      await client.query(
        `
          UPDATE products
          SET stock = stock - $2, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `,
        [item.product.id, item.quantity],
      );
    }

    await client.query("COMMIT");
    return { order, totals };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getOrdersByUser(userId) {
  const { rows } = await pool.query(
    `
      SELECT id, status, total_amount, shipping_name, shipping_email, shipping_address, created_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC, id DESC
    `,
    [userId],
  );
  return rows;
}

async function getStoreSummary() {
  const rows = await safeQuery(
    `
    SELECT
      (SELECT COUNT(*) FROM products) AS total_products,
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM orders) AS total_orders,
      COALESCE((SELECT SUM(total_amount) FROM orders), 0) AS total_revenue,
      COALESCE((SELECT SUM(stock) FROM products), 0) AS total_stock,
      COALESCE(
        (
          SELECT ROUND(
            (COUNT(*) FILTER (WHERE stock <= 5) * 100.0) / NULLIF(COUNT(*), 0),
            1
          )
          FROM products
        ),
        0
      ) AS support_rate
  `,
    [],
    [
      {
        total_products: 0,
        total_users: 0,
        total_orders: 0,
        total_revenue: 0,
        total_stock: 0,
        support_rate: 0,
      },
    ],
  );
  return rows[0];
}

async function getRevenueByMonth() {
  const rows = await safeQuery(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS periodo,
      COALESCE(SUM(total_amount), 0) AS valor_total,
      COUNT(id) AS pedidos
    FROM orders
    GROUP BY DATE_TRUNC('month', created_at)
    ORDER BY DATE_TRUNC('month', created_at) ASC
  `);
  return rows;
}

async function getTopProducts() {
  const rows = await safeQuery(`
    SELECT
      p.name,
      p.category,
      COALESCE(SUM(oi.quantity), 0) AS unidades,
      COALESCE(SUM(oi.line_total), 0) AS ingresos
    FROM order_items oi
    INNER JOIN products p ON p.id = oi.product_id
    GROUP BY p.id, p.name, p.category
    ORDER BY ingresos DESC, unidades DESC
    LIMIT 8
  `);
  return rows;
}

async function getCategoryMix() {
  const rows = await safeQuery(`
    SELECT
      category,
      COUNT(*) AS total,
      COALESCE(SUM(stock), 0) AS stock
    FROM products
    GROUP BY category
    ORDER BY total DESC, category ASC
  `);
  return rows;
}

async function getAdminOverview() {
  const [
    summary,
    revenue,
    topProducts,
    categoryMix,
    recentOrders,
    recentProducts,
    users,
  ] = await Promise.all([
    getStoreSummary(),
    getRevenueByMonth(),
    getTopProducts(),
    getCategoryMix(),
    safeQuery(`
      SELECT id, status, total_amount, shipping_name, created_at
      FROM orders
      ORDER BY created_at DESC, id DESC
      LIMIT 8
    `),
    safeQuery(`
      SELECT id, name, category, price, stock, featured, created_at
      FROM products
      ORDER BY featured DESC, created_at DESC, id DESC
      LIMIT 8
    `),
    safeQuery(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC, id DESC
      LIMIT 8
    `),
  ]);

  const recentActivity = [
    ...recentOrders.map((order) => ({
      actor: order.shipping_name || "Cliente",
      action: `registro pedido #${order.id}`,
      area: "Operaciones",
      created_at: order.created_at,
    })),
    ...recentProducts.map((product) => ({
      actor: "Catalogo",
      action: `actualizo ${product.name}`,
      area: "Inventario",
      created_at: product.created_at,
    })),
    ...users.map((user) => ({
      actor: user.name,
      action: `cambio rol a ${user.role}`,
      area: "Usuarios",
      created_at: user.created_at,
    })),
  ]
    .filter((item) => item.created_at)
    .sort(
      (left, right) => new Date(right.created_at) - new Date(left.created_at),
    )
    .slice(0, 8);

  return {
    summary,
    revenue,
    topProducts,
    categoryMix,
    recentOrders,
    recentProducts,
    users,
    recentActivity,
  };
}

async function getAdminUsers(limit = 40) {
  const { rows } = await pool.query(
    `
      SELECT id, name, email, role, status, created_at
      FROM users
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit],
  );
  return rows;
}

async function getAdminInventory(limit = 40) {
  const { rows } = await pool.query(
    `
      SELECT id, name, category, price, stock, featured, created_at
      FROM products
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit],
  );
  return rows;
}

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductsByIds,
  getSuggestedProducts,
  createProductRecord,
  createOrderFromCart,
  getOrdersByUser,
  getStoreSummary,
  getRevenueByMonth,
  getTopProducts,
  getCategoryMix,
  getAdminOverview,
  getAdminUsers,
  getAdminInventory,
};
