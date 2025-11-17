import { Request, Response } from "express";
import { momoPaymentService } from "#common/services/payment/momo-payment.service.js";

export const momoPayment = async (req: Request, res: Response) => {
    try {
        const { amount, orderId } = req.body;
        const payUrl = await momoPaymentService({ amount, orderId });
        res.json({ payUrl });
    } catch (err) {
        console.error("Momo create payment error:", err);
        res.status(500).json({ message: "Tạo thanh toán thất bại" });
    }
};


