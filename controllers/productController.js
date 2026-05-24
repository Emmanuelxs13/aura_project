const productService = require("../services/productService");

const productController = {
  async list(req, res, next) {
    try {
      const { category, featured, search, limit, offset } = req.query;
      const filters = {};

      if (category) filters.category = category;
      if (featured) filters.featured = featured === "true";
      if (search) filters.search = search;
      if (limit) filters.limit = parseInt(limit, 10);
      if (offset) filters.offset = parseInt(offset, 10);

      const products = await productService.listProducts(filters);
      res.json({ products });
    } catch (error) {
      next(error);
    }
  },

  async getFeatured(req, res, next) {
    try {
      const products = await productService.getFeatured();
      res.json({ products });
    } catch (error) {
      next(error);
    }
  },

  async getBySlug(req, res, next) {
    try {
      const product = await productService.getBySlug(req.params.slug);
      res.json({ product });
    } catch (error) {
      next(error);
    }
  },

  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();
      res.json({ categories });
    } catch (error) {
      next(error);
    }
  },

  async search(req, res, next) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.json({ products: [] });
      }
      const products = await productService.listProducts({ search: q });
      res.json({ products });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = productController;
