const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const { AppError } = require("../middleware/errorHandler");

class OrderService {
  async createOrder({ user_id, shipping_name, shipping_email, shipping_address, items }) {
    if (!items || !items.length) {
      throw new AppError("El pedido debe contener al menos un producto");
    }
    if (!shipping_name || !shipping_email || !shipping_address) {
      throw new AppError("Datos de envio incompletos");
    }

    let total_amount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await ProductModel.findById(item.product_id);
      if (!product) {
        throw new AppError(`Producto ID ${item.product_id} no encontrado`);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Stock insuficiente para ${product.name}`);
      }

      const unit_price = Number(product.price);
      const line_total = unit_price * item.quantity;
      total_amount += line_total;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price,
        line_total,
      });
    }

    return OrderModel.create({
      user_id,
      total_amount,
      shipping_name,
      shipping_email,
      shipping_address,
      items: orderItems,
    });
  }

  async getUserOrders(userId, pagination) {
    return OrderModel.findByUser(userId, pagination);
  }

  async getOrder(orderId) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new AppError("Pedido no encontrado", 404);
    }
    return order;
  }

  async getAllOrders(filters) {
    return OrderModel.findAll(filters);
  }

  async updateOrderStatus(orderId, status) {
    const validStatuses = ["Pending", "Paid", "Processing", "Packed", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Estado invalido. Debe ser: ${validStatuses.join(", ")}`);
    }

    const order = await OrderModel.updateStatus(orderId, status);
    if (!order) {
      throw new AppError("Pedido no encontrado", 404);
    }
    return order;
  }
}

module.exports = new OrderService();
