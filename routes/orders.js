const { Router } = require("express");
const orderController = require("../controllers/orderController");
const { authenticateToken } = require("../middleware/auth");

const router = Router();

router.use(authenticateToken);
router.post("/", orderController.create);
router.get("/", orderController.list);
router.get("/:id", orderController.getById);

module.exports = router;
