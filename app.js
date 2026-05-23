const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const session = require("express-session");
require("dotenv").config();

const { pool } = require("./config/database");
const {
  renderHome,
  renderCatalog,
  searchCatalog,
  renderProductDetail,
  renderCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  checkout,
  renderDashboard,
  renderAdmin,
  renderAdminUsers,
  renderAdminInventory,
  renderAdminDevices,
  createDevice,
  updateDeviceHandler,
  deleteDeviceHandler,
  renderDeviceEdit,
  assignDeviceHandler,
  renderDeviceLogs,
  createDeviceLog,
  updateMaintenanceLogHandler,
  deleteMaintenanceLogHandler,
  renderAdminSupport,
  renderAdminSettings,
  renderAudit,
  createAdminUser,
  changeAdminUserRole,
  changeAdminUserStatus,
  createProduct,
} = require("./controllers/storeController");
const { renderLogin, login, logout } = require("./controllers/authController");
const {
  renderAnalytics,
  getValuationReport,
} = require("./controllers/analyticsController");
const {
  attachAuthContext,
  requireAuth,
  requireAdmin,
} = require("./middleware/auth");
const { createProductRecord, getProducts } = require("./models/storeModel");

const app = express();
const port = process.env.PORT || 3000;
const VALID_CATEGORIES = [
  "Mac",
  "iPad",
  "iPhone",
  "Audio",
  "Displays",
  "Accessories",
];

app.disable("x-powered-by");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/vendor",
  express.static(path.join(__dirname, "node_modules/chart.js/dist")),
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || "aura-store-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  }),
);
app.use(attachAuthContext);

app.get("/", renderHome);
app.get("/shop", renderCatalog);
app.get("/devices", renderCatalog);
app.get("/product/:slug", renderProductDetail);
app.get("/cart", renderCart);
app.get("/dashboard", requireAuth, renderDashboard);
app.get("/account", requireAuth, renderDashboard);
app.get("/admin", requireAdmin, renderAdmin);
app.get("/admin/users", requireAdmin, renderAdminUsers);
app.get("/admin/inventory", requireAdmin, renderAdminInventory);
app.get("/admin/devices", requireAdmin, renderAdminDevices);
app.post("/admin/devices", requireAdmin, createDevice);
app.post("/admin/devices/:deviceId", requireAdmin, updateDeviceHandler);
app.post("/admin/devices/:deviceId/delete", requireAdmin, deleteDeviceHandler);
app.get("/admin/devices/:deviceId/logs", requireAdmin, renderDeviceLogs);
app.post("/admin/devices/:deviceId/logs", requireAdmin, createDeviceLog);
app.get("/admin/devices/:deviceId/edit", requireAdmin, renderDeviceEdit);
app.post("/admin/devices/:deviceId/assign", requireAdmin, assignDeviceHandler);
app.post(
  "/admin/devices/:deviceId/logs/:logId/status",
  requireAdmin,
  updateMaintenanceLogHandler,
);
app.post(
  "/admin/devices/:deviceId/logs/:logId/delete",
  requireAdmin,
  deleteMaintenanceLogHandler,
);
app.get("/admin/support", requireAdmin, renderAdminSupport);
app.get("/admin/audit", requireAdmin, renderAudit);
app.get("/admin/settings", requireAdmin, renderAdminSettings);
app.get("/analytics", requireAdmin, renderAnalytics);
app.get("/login", renderLogin);
app.get("/robots.txt", renderRobotsTxt);
app.get("/sitemap.xml", renderSitemapXml);

app.post("/login", login);
app.post("/logout", logout);
app.post("/cart/items", addToCart);
app.post("/cart/items/:productId", updateCartItem);
app.post("/cart/items/:productId/remove", removeCartItem);
app.post("/checkout", checkout);
app.post("/admin/products", requireAdmin, createProduct);
app.post("/admin/users", requireAdmin, createAdminUser);
app.post("/admin/users/:userId/role", requireAdmin, changeAdminUserRole);
app.post("/admin/users/:userId/status", requireAdmin, changeAdminUserStatus);

app.get("/api/v1/analytics/valuation", getValuationReport);
app.get("/api/v1/products/search", searchCatalog);

const createProductEndpoint = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const validationErrors = validateProductPayload(payload);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Solicitud invalida",
        errors: validationErrors,
      });
    }

    const normalized = normalizeProductPayload(payload);

    const result = await createProductRecord({
      ...normalized,
    });

    return res.status(201).json({
      status: "created",
      product_id: result.id,
      message: "Producto premium registrado exitosamente en Aura Store.",
    });
  } catch (error) {
    if (["23505", "23514", "22P02", "22007"].includes(error.code)) {
      return res.status(400).json({
        status: "error",
        message: "Solicitud invalida para la base de datos",
        errors: [error.detail || error.message],
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        status: "error",
        message: "La solicitud referencia datos inexistentes",
        errors: [error.detail || error.message],
      });
    }

    next(error);
  }
};

function normalizeProductPayload(payload) {
  const category = String(payload.category || "").trim();
  return {
    name: String(payload.name || payload.model_name || "").trim(),
    slug: String(payload.slug || "").trim() || undefined,
    category,
    tagline: String(
      payload.tagline || payload.hero_note || `${category} de alto rendimiento`,
    ).trim(),
    description: String(
      payload.description || `Producto premium de la categoria ${category}.`,
    ).trim(),
    price: Number(payload.price ?? payload.purchase_price),
    compare_at_price:
      payload.compare_at_price === undefined ||
      payload.compare_at_price === null ||
      payload.compare_at_price === ""
        ? null
        : Number(payload.compare_at_price),
    stock: Number(payload.stock ?? 0),
    colorway: String(payload.colorway || payload.finish || "Midnight").trim(),
    specifications: payload.specifications || null,
    featured: Boolean(payload.featured),
  };
}

function validateProductPayload(payload) {
  const validationErrors = [];
  const name = String(payload.name || payload.model_name || "").trim();
  const category = String(payload.category || "").trim();
  const price = payload.price ?? payload.purchase_price;
  const compareAtPrice = payload.compare_at_price;
  const stock = payload.stock ?? 0;

  if (!name) validationErrors.push("name o model_name es requerido.");
  if (!category) validationErrors.push("category es requerido.");
  if (category && !VALID_CATEGORIES.includes(category)) {
    validationErrors.push(
      `category debe ser una de: ${VALID_CATEGORIES.join(", ")}.`,
    );
  }
  if (
    price === undefined ||
    price === null ||
    Number.isNaN(Number(price)) ||
    Number(price) <= 0
  ) {
    validationErrors.push(
      "price o purchase_price debe ser un numero mayor a cero.",
    );
  }
  if (
    compareAtPrice !== undefined &&
    compareAtPrice !== null &&
    compareAtPrice !== "" &&
    Number.isNaN(Number(compareAtPrice))
  ) {
    validationErrors.push("compare_at_price debe ser numerico.");
  }
  if (stock !== undefined && stock !== null && Number.isNaN(Number(stock))) {
    validationErrors.push("stock debe ser numerico.");
  }
  if (
    payload.specifications !== undefined &&
    payload.specifications !== null &&
    typeof payload.specifications !== "object"
  ) {
    validationErrors.push("specifications debe ser un objeto JSON valido.");
  }

  return validationErrors;
}

app.post("/api/v1/devices", createProductEndpoint);
app.post("/api/devices", createProductEndpoint);
app.post("/api/v1/products", createProductEndpoint);

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  return res
    .status(500)
    .json({ status: "error", message: "Error interno del servidor" });
});

async function start() {
  try {
    await bootstrapDatabase();
    await pool.query("SELECT 1");
    const { server, actualPort } = await listenWithFallback(port);
    app.locals.server = server;
    console.log(`Aura Store running on http://localhost:${actualPort}`);
  } catch (error) {
    console.error("No se pudo conectar a PostgreSQL:", error.message);
    process.exit(1);
  }
}

start();

async function bootstrapDatabase() {
  const { rows } = await pool.query(`
    SELECT
      to_regclass('public.users') AS users_table,
      to_regclass('public.products') AS products_table,
      to_regclass('public.orders') AS orders_table,
      to_regclass('public.order_items') AS order_items_table
  `);

  const schemaState = rows[0] || {};
  const allTablesReady = [
    schemaState.users_table,
    schemaState.products_table,
    schemaState.orders_table,
    schemaState.order_items_table,
  ].every(Boolean);

  if (allTablesReady) {
    return;
  }

  const schemaPath = path.join(__dirname, "db", "backup.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schemaSql);
}

function listenWithFallback(initialPort, retries = 5) {
  return new Promise((resolve, reject) => {
    const server = app.listen(initialPort);

    server.once("listening", () => {
      resolve({
        server,
        actualPort: server.address().port,
      });
    });

    server.once("error", (error) => {
      if (error.code === "EADDRINUSE" && retries > 0 && initialPort !== 0) {
        server.close(() => {
          listenWithFallback(Number(initialPort) + 1, retries - 1)
            .then(resolve)
            .catch(reject);
        });
        return;
      }

      reject(error);
    });
  });
}

async function renderRobotsTxt(req, res, next) {
  try {
    res.type("text/plain");
    res.send(
      [
        "User-agent: *",
        "Allow: /",
        `Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml`,
        "",
      ].join("\n"),
    );
  } catch (error) {
    next(error);
  }
}

async function renderSitemapXml(req, res, next) {
  try {
    const products = await getProducts();
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const urls = ["/", "/shop", "/cart", "/login"]
      .map((path) => `<url><loc>${baseUrl}${path}</loc></url>`)
      .concat(
        products.map(
          (product) =>
            `<url><loc>${baseUrl}/product/${product.slug}</loc></url>`,
        ),
      )
      .join("");

    res.type("application/xml");
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    );
  } catch (error) {
    next(error);
  }
}
