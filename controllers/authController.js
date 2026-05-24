const authService = require("../services/authService");
const { generateToken } = require("../middleware/auth");

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "name, email y password son requeridos" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "La contrasena debe tener al menos 6 caracteres" });
      }

      const user = await authService.register({ name, email, password });
      const token = generateToken(user);

      res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "email y password son requeridos" });
      }

      const user = await authService.login({ email, password });
      const token = generateToken(user);

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  },

  async me(req, res) {
    res.json({ user: req.user });
  },
};

module.exports = authController;
