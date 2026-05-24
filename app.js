const express = require("express");
const cors = require("cors");
const path = require("node:path");
const fs = require("node:fs");
require("dotenv").config();

const { pool } = require("./config/database");
const apiRoutes = require("./routes/index");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/public", express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "production") {
  const frontendBuild = path.join(__dirname, "frontend", "dist");
  app.use(express.static(frontendBuild));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendBuild, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await bootstrapDatabase();
    const { rows } = await pool.query("SELECT 1");
    console.log("PostgreSQL connected successfully");

    const { actualPort } = await listenWithFallback(PORT);
    console.log(`Aura Store API running on http://localhost:${actualPort}`);
    console.log(`Frontend dev server expected at http://localhost:5173`);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

function splitSQL(sql) {
  const statements = [];
  let current = "";
  let inString = false;

  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    const prev = i > 0 ? sql[i - 1] : "";
    if (c === "'" && prev !== "\\") inString = !inString;
    if (c === ";" && !inString) {
      const trimmed = current.trim();
      if (trimmed && !trimmed.startsWith("--")) statements.push(trimmed);
      current = "";
    } else {
      current += c;
    }
  }
  const last = current.trim();
  if (last && !last.startsWith("--")) statements.push(last);
  return statements;
}

function listenWithFallback(initialPort, retries = 5) {
  return new Promise((resolve, reject) => {
    const server = app.listen(initialPort);

    server.once("listening", () => {
      resolve({ server, actualPort: server.address().port });
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

  if (allTablesReady) return;

  const schemaPath = path.join(__dirname, "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  const statements = splitSQL(schemaSql);
  for (const stmt of statements) {
    try {
      await pool.query(stmt);
    } catch (err) {
      console.error(`Schema statement failed (skipping): ${err.message}`);
    }
  }
  console.log("Database schema bootstrapped from schema.sql");
}

start();
