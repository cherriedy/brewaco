import { getAllOrders } from "#common/controllers/order/get-all-orders.controller.js";
import { getOrderByIdForAdmin } from "#common/controllers/order/get-order-by-admin.controller.js";
import { updateOrderStatus } from "#common/controllers/order/update-order-status.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderByIdForAdmin);
router.patch("/:id", updateOrderStatus);

export default router;
