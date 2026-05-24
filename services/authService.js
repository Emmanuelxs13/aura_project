const bcrypt = require("bcryptjs");
const UserModel = require("../models/userModel");
const { AppError } = require("../middleware/errorHandler");

class AuthService {
  async register({ name, email, password }) {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new AppError("El email ya esta registrado", 409);
    }

    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await UserModel.create({ name, email, password_hash });
    return user;
  }

  async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AppError("Credenciales invalidas", 401);
    }

    if (user.status === "Suspended") {
      throw new AppError("Cuenta suspendida. Contacte al administrador", 403);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError("Credenciales invalidas", 401);
    }

    return user;
  }

  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }
    return user;
  }

  isAdmin(role) {
    return ["Administrator", "Admin", "Operador", "Auditor"].includes(role);
  }
}

module.exports = new AuthService();
