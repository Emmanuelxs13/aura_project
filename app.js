const express = require("express");
const path = require("node:path");
require("dotenv").config();

const { pool } = require("./config/database");
const {
  renderHome,
  renderDashboard,
  renderDevicesPage,
} = require("./controllers/deviceController");
const {
  renderAnalytics,
  getValuationReport,
} = require("./controllers/analyticsController");
const { createDevice } = require("./models/deviceModel");

const app = express();
const port = process.env.PORT || 3000;
const VALID_CATEGORIES = ["Mac", "iPad", "iPhone", "Audio", "Displays"];

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

app.get("/", renderHome);
app.get("/dashboard", renderDashboard);
app.get("/devices", renderDevicesPage);
app.get("/analytics", renderAnalytics);

app.get("/api/v1/analytics/valuation", getValuationReport);
const createDeviceEndpoint = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const validationErrors = [];

    if (!payload.model_name || typeof payload.model_name !== "string")
      validationErrors.push("model_name es requerido y debe ser texto.");
    if (!payload.category || typeof payload.category !== "string")
      validationErrors.push("category es requerido y debe ser texto.");
    if (
      typeof payload.category === "string" &&
      !VALID_CATEGORIES.includes(payload.category.trim())
    ) {
      validationErrors.push(
        `category debe ser una de: ${VALID_CATEGORIES.join(", ")}.`,
      );
    }
    if (!payload.serial_number || typeof payload.serial_number !== "string")
      validationErrors.push("serial_number es requerido y debe ser texto.");
    if (
      payload.purchase_price === undefined ||
      payload.purchase_price === null ||
      Number.isNaN(Number(payload.purchase_price)) ||
      Number(payload.purchase_price) <= 0
    )
      validationErrors.push("purchase_price debe ser un numero mayor a cero.");
    if (
      !payload.purchase_date ||
      Number.isNaN(Date.parse(payload.purchase_date))
    )
      validationErrors.push(
        "purchase_date es requerido y debe ser una fecha valida.",
      );
    if (
      payload.specifications !== undefined &&
      payload.specifications !== null &&
      typeof payload.specifications !== "object"
    )
      validationErrors.push("specifications debe ser un objeto JSON valido.");

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Solicitud invalida",
        errors: validationErrors,
      });
    }

    const result = await createDevice({
      model_name: payload.model_name.trim(),
      category: payload.category.trim(),
      serial_number: payload.serial_number.trim(),
      purchase_price: Number(payload.purchase_price),
      purchase_date: payload.purchase_date,
      specifications: payload.specifications || null,
    });

    return res.status(201).json({
      status: "created",
      device_id: result.id,
      message: "Activo premium registrado exitosamente en el ecosistema Aura.",
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

app.post("/api/v1/devices", createDeviceEndpoint);
app.post("/api/devices", createDeviceEndpoint);

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
    await pool.query("SELECT 1");
    app.listen(port, () => {
      console.log(`Aura app running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("No se pudo conectar a PostgreSQL:", error.message);
    process.exit(1);
  }
}

start();
