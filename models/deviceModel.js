const { pool } = require("../config/database");

async function getAllDevices(category = "") {
  const values = [];
  let sql = `
    SELECT
      id,
      model_name,
      category,
      serial_number,
      status,
      purchase_price,
      purchase_date,
      specifications,
      created_at
    FROM devices
  `;

  if (category) {
    values.push(category);
    sql += ` WHERE category = $1`;
  }

  sql += ` ORDER BY created_at DESC, id DESC`;
  const { rows } = await pool.query(sql, values);
  return rows;
}

async function createDevice(device) {
  const sql = `
    INSERT INTO devices (
      model_name,
      category,
      serial_number,
      status,
      purchase_price,
      purchase_date,
      specifications
    ) VALUES ($1, $2, $3, 'Available', $4, $5, $6)
    RETURNING id
  `;

  const values = [
    device.model_name,
    device.category,
    device.serial_number,
    device.purchase_price,
    device.purchase_date,
    device.specifications,
  ];

  const { rows } = await pool.query(sql, values);
  return rows[0];
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

module.exports = {
  getAllDevices,
  createDevice,
  getValuationAnalytics,
  getRotationAnalytics,
};
