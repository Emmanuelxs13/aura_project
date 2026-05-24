const { Router } = require("express");
const authRoutes = require("./auth");
const productRoutes = require("./products");
const orderRoutes = require("./orders");
const adminRoutes = require("./admin");

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
