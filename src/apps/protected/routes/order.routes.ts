import { getAllOrders } from "#common/controllers/order/get-all-orders.controller.js";
import { updateOrderStatus } from "#common/controllers/order/update-order-status.controller.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllOrders);
router.patch("/:id/status", updateOrderStatus);

export default router;
