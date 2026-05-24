const productService = require("../services/productService");
const orderService = require("../services/orderService");
const UserModel = require("../models/userModel");
const AnalyticsModel = require("../models/analyticsModel");
const { AppError } = require("../middleware/errorHandler");

const adminController = {
  async getDashboard(req, res, next) {
    try {
      const metrics = await AnalyticsModel.getDashboardMetrics();
      const topProducts = await AnalyticsModel.getTopProducts();
      const monthlySales = await AnalyticsModel.getMonthlySales();
      const salesByCategory = await AnalyticsModel.getSalesByCategory();
      const orderStatus = await AnalyticsModel.getDashboardMetrics();
      const userRoles = await UserModel.getCountByRole();

      res.json({
        metrics,
        topProducts,
        monthlySales,
        salesByCategory,
        userRoles,
      });
    } catch (error) {
      next(error);
    }
  },

  // Products CRUD
  async listProducts(req, res, next) {
    try {
      const { category, page = 1, pageSize = 20 } = req.query;
      const products = await productService.listProducts({
        category,
        limit: parseInt(pageSize, 10),
        offset: (parseInt(page, 10) - 1) * parseInt(pageSize, 10),
      });
      res.json({ products });
    } catch (error) {
      next(error);
    }
  },

  async getProduct(req, res, next) {
    try {
      const product = await productService.getById(req.params.id);
      res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({ product });
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
      next(error);
    }
  },

  // Users management
  async listUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 20;
      const result = await UserModel.findAll({ page, pageSize });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const validRoles = ["Administrator", "Admin", "Operador", "Auditor", "Customer"];
      if (!validRoles.includes(role)) {
        throw new AppError(`Rol invalido. Debe ser: ${validRoles.join(", ")}`);
      }
      const user = await UserModel.updateRole(req.params.id, role);
      if (!user) throw new AppError("Usuario no encontrado", 404);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!["Active", "Suspended"].includes(status)) {
        throw new AppError("Estado invalido. Debe ser Active o Suspended");
      }
      const user = await UserModel.updateStatus(req.params.id, status);
      if (!user) throw new AppError("Usuario no encontrado", 404);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  // Orders management
  async listOrders(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 20;
      const { status } = req.query;
      const result = await orderService.getAllOrders({ page, pageSize, status });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async updateOrderStatus(req, res, next) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
      res.json({ order });
    } catch (error) {
      next(error);
    }
  },

  // Analytics endpoints
  async getAnalytics(req, res, next) {
    try {
      const metrics = await AnalyticsModel.getDashboardMetrics();
      const topProducts = await AnalyticsModel.getTopProducts(10);
      const monthlySales = await AnalyticsModel.getMonthlySales();
      const salesByCategory = await AnalyticsModel.getSalesByCategory();

      res.json({ metrics, topProducts, monthlySales, salesByCategory });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminController;
