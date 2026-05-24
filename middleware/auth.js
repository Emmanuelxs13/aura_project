const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "aura-store-jwt-secret-key-2024";

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de autenticacion requerido" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT id, name, email, role, status FROM users WHERE id = $1",
      [decoded.id]
    );

    if (!rows.length || rows[0].status === "Suspended") {
      return res.status(401).json({ error: "Usuario no encontrado o suspendido" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }
    return res.status(403).json({ error: "Token invalido" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Autenticacion requerida" });
  }
  const adminRoles = ["Administrator", "Admin", "Operador", "Auditor"];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ error: "Acceso denegado. Se requiere rol de administrador" });
  }
  next();
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await pool.query(
      "SELECT id, name, email, role, status FROM users WHERE id = $1",
      [decoded.id]
    );

    if (rows.length && rows[0].status !== "Suspended") {
      req.user = rows[0];
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, optionalAuth, generateToken };
