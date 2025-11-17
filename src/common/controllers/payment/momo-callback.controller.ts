import { Request, Response } from "express";
import { handleMomoCallback } from "#common/services/payment/momo-callback.service.js";

export const momoCallback = async (req: Request, res: Response) => {
    try {
        await handleMomoCallback(req.body);
        res.status(200).json({ message: "ok" });
        console.log("📥 CALLBACK RECEIVED FROM MOMO:");
        console.log(req.body);
    } catch (err) {
        console.error("Momo callback error:", err);

        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }

        res.status(500).json({ message: "Callback xử lý lỗi" });
    }
};