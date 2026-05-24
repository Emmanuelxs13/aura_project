const slugify = require("../utils/slugify");
const ProductModel = require("../models/productModel");
const { AppError } = require("../middleware/errorHandler");

const VALID_CATEGORIES = ["Mac", "iPad", "iPhone", "Audio", "Displays", "Accessories"];

class ProductService {
  async listProducts(filters = {}) {
    return ProductModel.findAll(filters);
  }

  async getFeatured() {
    return ProductModel.getFeatured();
  }

  async getBySlug(slug) {
    const product = await ProductModel.findBySlug(slug);
    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }
    return product;
  }

  async getById(id) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }
    return product;
  }

  async createProduct(data) {
    this.validateProductData(data);

    const slug = data.slug || slugify(data.name);
    const existing = await ProductModel.findBySlug(slug);
    if (existing) {
      throw new AppError("Ya existe un producto con ese slug", 409);
    }

    return ProductModel.create({ ...data, slug });
  }

  async updateProduct(id, data) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new AppError("Producto no encontrado", 404);
    }

    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
      throw new AppError(`Categoria invalida. Debe ser: ${VALID_CATEGORIES.join(", ")}`);
    }

    return ProductModel.update(id, data);
  }

  async deleteProduct(id) {
    const result = await ProductModel.delete(id);
    if (!result) {
      throw new AppError("Producto no encontrado", 404);
    }
    return result;
  }

  async getCategories() {
    return ProductModel.getCategories();
  }

  validateProductData(data) {
    const errors = [];

    if (!data.name || !data.name.trim()) {
      errors.push("name es requerido");
    }
    if (!data.category || !VALID_CATEGORIES.includes(data.category)) {
      errors.push(`category debe ser una de: ${VALID_CATEGORIES.join(", ")}`);
    }
    if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
      errors.push("price debe ser un numero mayor a cero");
    }
    if (data.compare_at_price && (isNaN(Number(data.compare_at_price)) || Number(data.compare_at_price) <= Number(data.price))) {
      errors.push("compare_at_price debe ser mayor que price");
    }
    if (data.stock !== undefined && (isNaN(Number(data.stock)) || Number(data.stock) < 0)) {
      errors.push("stock debe ser un numero valido mayor o igual a cero");
    }

    if (errors.length > 0) {
      throw new AppError(errors.join(". "));
    }
  }
}

module.exports = new ProductService();
