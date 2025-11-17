import { Router } from "express";
import { momoCallback } from "#common/controllers/payment/momo-callback.controller.js";
import { vnpayReturn } from "#common/controllers/payment/vnpay-payment.controller.js";

const router = Router();

// Callback là public, không auth middleware
router.post("/momo", momoCallback);
router.get("/vnpay", vnpayReturn);

export default router;
