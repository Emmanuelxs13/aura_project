const { pool } = require("../config/database");

async function getAllDevices(limit = 100) {
  const { rows } = await pool.query(
    `
      SELECT id, model_name, category, serial_number, status, assigned_to, purchase_price, purchase_date, specifications, created_at
      FROM devices
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit],
  );
  return rows;
}

async function getDeviceById(id) {
  const { rows } = await pool.query(
    `
      SELECT id, model_name, category, serial_number, status, assigned_to, purchase_price, purchase_date, specifications, created_at
      FROM devices
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  return rows[0] || null;
}

async function createDevice(device) {
  const { rows } = await pool.query(
    `
      INSERT INTO devices (model_name, category, serial_number, status, purchase_price, purchase_date, specifications)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, model_name, category, serial_number, status, purchase_price, purchase_date, specifications, created_at
    `,
    [
      device.model_name,
      device.category,
      device.serial_number,
      device.status || "Available",
      device.purchase_price || null,
      device.purchase_date || null,
      device.specifications || null,
    ],
  );
  return rows[0];
}

async function updateDevice(id, patch) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of [
    "model_name",
    "category",
    "serial_number",
    "status",
    "assigned_to",
    "purchase_price",
    "purchase_date",
    "specifications",
  ]) {
    if (key in patch) {
      fields.push(`${key} = $${idx}`);
      values.push(patch[key]);
      idx += 1;
    }
  }

  if (fields.length === 0) {
    return getDeviceById(id);
  }

  values.push(id);
  const sql = `UPDATE devices SET ${fields.join(",")} , updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
}

async function deleteDevice(id) {
  const { rows } = await pool.query(
    `DELETE FROM devices WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows[0] || null;
}

async function getValuationAnalytics() {
  const sql = `
    WITH months AS (
      SELECT DISTINCT DATE_TRUNC('month', purchase_date) AS month_date
      FROM devices
    )
    SELECT
      TO_CHAR(months.month_date, 'YYYY-MM') AS periodo,
      COALESCE(SUM(d.purchase_price), 0) AS valor_total,
      COUNT(d.id) AS unidades
    FROM months
    LEFT JOIN devices d ON DATE_TRUNC('month', d.purchase_date) = months.month_date
    GROUP BY months.month_date
    ORDER BY months.month_date ASC;
  `;

  const { rows } = await pool.query(sql);
  return rows;
}

async function getRotationAnalytics() {
  const sql = `
    SELECT
      d.category AS categoria,
      COUNT(d.id) AS inventario_total,
      ROUND((COUNT(CASE WHEN d.status = 'Assigned' THEN 1 END) * 100.0 / NULLIF(COUNT(d.id), 0)), 1) AS ratio_asignacion_pct,
      COALESCE(SUM(ml.maintenance_cost), 0.00) AS costo_total_soporte,
      COUNT(ml.id) AS cantidad_incidentes_historicos,
      CASE
        WHEN COUNT(ml.id) = 0 THEN 'Saludable'
        WHEN COUNT(ml.id) BETWEEN 1 AND 2 THEN 'Estable'
        ELSE 'Acción Requerida'
      END AS estado_alerta
    FROM devices d
    LEFT JOIN maintenance_logs ml ON d.id = ml.device_id
    GROUP BY d.category
    ORDER BY inventario_total DESC;
  `;

  const { rows } = await pool.query(sql);
  return rows;
}

async function getMaintenanceLogs(deviceId) {
  const { rows } = await pool.query(
    `
      SELECT id, device_id, code, title, area, maintenance_cost, status, notes, created_at
      FROM maintenance_logs
      WHERE device_id = $1
      ORDER BY created_at DESC, id DESC
    `,
    [deviceId],
  );
  return rows;
}

async function createMaintenanceLog(log) {
  const { rows } = await pool.query(
    `
      INSERT INTO maintenance_logs (device_id, code, title, area, maintenance_cost, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, device_id, code, title, area, maintenance_cost, status, notes, created_at
    `,
    [
      log.device_id,
      log.code,
      log.title,
      log.area || null,
      log.maintenance_cost || 0.0,
      log.status || "Open",
      log.notes || null,
    ],
  );
  return rows[0];
}

async function getRecentMaintenanceLogs(limit = 50) {
  const { rows } = await pool.query(
    `
      SELECT ml.id, ml.device_id, ml.code, ml.title, ml.area, ml.maintenance_cost, ml.status, ml.notes, ml.created_at, d.model_name
      FROM maintenance_logs ml
      LEFT JOIN devices d ON d.id = ml.device_id
      ORDER BY ml.created_at DESC
      LIMIT $1
    `,
    [limit],
  );
  return rows;
}

async function updateMaintenanceLog(id, patch) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of [
    "code",
    "title",
    "area",
    "maintenance_cost",
    "status",
    "notes",
  ]) {
    if (key in patch) {
      fields.push(`${key} = $${idx}`);
      values.push(patch[key]);
      idx += 1;
    }
  }

  if (fields.length === 0) return null;
  values.push(id);
  const sql = `UPDATE maintenance_logs SET ${fields.join(",")} , updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(sql, values);
  return rows[0] || null;
}

async function deleteMaintenanceLog(id) {
  const { rows } = await pool.query(
    `DELETE FROM maintenance_logs WHERE id = $1 RETURNING id`,
    [id],
  );
  return rows[0] || null;
}

module.exports = {
  getAllDevices,
  createDevice,
  getValuationAnalytics,
  getRotationAnalytics,
  getDeviceById,
  updateDevice,
  deleteDevice,
  getMaintenanceLogs,
  createMaintenanceLog,
  getRecentMaintenanceLogs,
  updateMaintenanceLog,
  deleteMaintenanceLog,
};
