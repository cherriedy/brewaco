import { Router } from "express";
import { momoCallback } from "#common/controllers/payment/momo-callback.controller.js";
import { vnpayCallback } from "#common/controllers/payment/vnpay-callback.controller.js";

const router = Router();

// Callback là public, không auth middleware
router.post("/momo", momoCallback);
router.post("/vnpay", vnpayCallback);

export default router;
