import { deletePayment } from "#common/controllers/payment/delete-payment.controller.js";
import { getPayment } from "#common/controllers/payment/get-payment.controller.js";
import { getPayments } from "#common/controllers/payment/get-payments.controller.js";
import { refundMomo } from "#common/controllers/payment/refund-momo.controller.js";
import { updatePaymentStatus } from "#common/controllers/payment/update-payment-status.controller.js";
import { Router } from "express";

const router = Router();

router.post("/refund-momo", refundMomo);

router.get("/", getPayments);
router.get("/:id", getPayment);
router.patch("/:id", updatePaymentStatus);
router.delete("/:id", deletePayment);

export default router;
