import { momoPayment } from "#common/controllers/payment/momo-payment.controller.js";
import { vnpayPayment } from "#common/controllers/payment/vnpay-payment.controller.js";
import { Router } from "express";


const router = Router();

router.post("/vnpay", vnpayPayment);
router.post("/momo", momoPayment);

export default router;
