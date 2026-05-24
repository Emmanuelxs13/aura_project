const { Router } = require("express");
const productController = require("../controllers/productController");

const router = Router();

router.get("/", productController.list);
router.get("/featured", productController.getFeatured);
router.get("/search", productController.search);
router.get("/categories", productController.getCategories);
router.get("/:slug", productController.getBySlug);

module.exports = router;
