function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "23505") {
    return res.status(409).json({
      error: "El recurso ya existe (valor duplicado)",
      detail: err.detail,
    });
  }

  if (err.code === "23503") {
    return res.status(400).json({
      error: "Referencia a datos inexistentes",
      detail: err.detail,
    });
  }

  if (err.code === "22P02" || err.code === "22007") {
    return res.status(400).json({
      error: "Formato de dato invalido",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : "Error interno del servidor";

  res.status(statusCode).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` });
}

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

module.exports = { errorHandler, notFoundHandler, AppError };
