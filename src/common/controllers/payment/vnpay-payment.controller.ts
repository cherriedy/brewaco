import { createVnpayUrl } from "#common/services/payment/vnpay-payment.service.js";
import { Request, Response } from "express";


export const vnpayPayment = (req: Request, res: Response) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán" });
    }

    const paymentUrl = createVnpayUrl({
      amount,
      orderId,
      orderInfo: `Thanh toan don hang ${orderId}`,
    });

    return res.json({ paymentUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const vnpayReturn = (req: Request, res: Response) => {
  const vnp_Params = req.query as Record<string, string>;
  const secureHash = vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHash;

  const sortedParams: Record<string, string> = {};
  Object.keys(vnp_Params)
    .sort()
    .forEach((key) => {
      sortedParams[key] = vnp_Params[key];
    });

  const qs = require("qs");
  const crypto = require("crypto");
  const signData = qs.stringify(sortedParams, { encode: false });
  const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET!);
  const checkHash = hmac.update(signData).digest("hex");

  if (secureHash === checkHash) {
    if (vnp_Params.vnp_ResponseCode === "00") {
      // TODO: cập nhật trạng thái đơn hàng = paid
      return res.send("Thanh toán thành công");
    } else {
      return res.send("Thanh toán thất bại");
    }
  } else {
    return res.send("Hash không hợp lệ");
  }
};
