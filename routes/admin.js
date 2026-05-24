const { Router } = require("express");
const adminController = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get("/dashboard", adminController.getDashboard);

router.get("/products", adminController.listProducts);
router.get("/products/:id", adminController.getProduct);
router.post("/products", adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);

router.get("/users", adminController.listUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/users/:id/status", adminController.updateUserStatus);

router.get("/orders", adminController.listOrders);
router.put("/orders/:id/status", adminController.updateOrderStatus);

router.get("/analytics", adminController.getAnalytics);

module.exports = router;
