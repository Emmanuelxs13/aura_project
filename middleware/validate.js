const { AppError } = require("./errorHandler");

function validate(schema) {
  return (req, res, next) => {
    const errors = [];
    const data = req.body || {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      if (rules.required && (value === undefined || value === null || value === "")) {
        errors.push(`${field} es requerido`);
        continue;
      }

      if (value === undefined || value === null || value === "") continue;

      if (rules.type === "number" && (isNaN(Number(value)) || Number(value) < (rules.min || 0))) {
        errors.push(`${field} debe ser un numero valido${rules.min ? ` mayor o igual a ${rules.min}` : ""}`);
      }

      if (rules.type === "string" && typeof value === "string") {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} debe tener maximo ${rules.maxLength} caracteres`);
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} debe ser uno de: ${rules.enum.join(", ")}`);
        }
      }

      if (rules.type === "email" && typeof value === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(`${field} debe ser un email valido`);
        }
      }

      if (rules.type === "array" && !Array.isArray(value)) {
        errors.push(`${field} debe ser un arreglo`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: "Error de validacion", details: errors });
    }

    next();
  };
}

module.exports = { validate };
