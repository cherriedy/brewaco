import { createPayment } from "#common/controllers/payment/create-payment.controller.js";
import { Router } from "express";

const router = Router();

router.post("/", createPayment);

export default router;
