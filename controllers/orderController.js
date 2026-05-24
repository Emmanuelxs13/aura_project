const orderService = require("../services/orderService");

const orderController = {
  async create(req, res, next) {
    try {
      const { shipping_name, shipping_email, shipping_address, items } = req.body;

      const order = await orderService.createOrder({
        user_id: req.user.id,
        shipping_name,
        shipping_email,
        shipping_address,
        items,
      });

      res.status(201).json({ order });
    } catch (error) {
      next(error);
    }
  },

  async list(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 20;

      const result = await orderService.getUserOrders(req.user.id, { page, pageSize });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrder(req.params.id);

      if (req.user.role === "Customer" && order.user_id !== req.user.id) {
        return res.status(403).json({ error: "No tienes permiso para ver esta orden" });
      }

      res.json({ order });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = orderController;
