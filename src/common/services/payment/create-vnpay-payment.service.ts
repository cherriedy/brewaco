import crypto from "crypto";
import { Payment } from "#common/models/payment.model.js";
import { Order } from "#common/models/order.model.js";
import { CreatePaymentPayload } from "#common/models/validation/payment.validation.js";

const vnp_TmnCode = process.env.VNP_TMN_CODE!;
const vnp_HashSecret = process.env.VNP_HASH_SECRET!;
const vnp_Url = process.env.VNP_URL!;
const vnp_ReturnUrl = process.env.VNP_RETURN_URL!;

export class CreateVnpayPaymentService {
  static async execute(data: CreatePaymentPayload) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const vnp_TxnRef = `${order._id}_${Date.now()}`;
    const vnp_OrderInfo = `Thanh toán đơn hàng #${order._id}`;
    const vnp_Amount = Number(data.amount!) * 100;
    const vnp_IpAddr = "0.0.0.0";
    const pad = (n: number) => n.toString().padStart(2, '0');
    const now = new Date();
    const vnp_CreateDate =
      `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    const vnp_Params: Record<string, string> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef,
      vnp_OrderInfo,
      vnp_OrderType: "other",
      vnp_Amount: vnp_Amount.toString(),
      vnp_ReturnUrl,
      vnp_IpAddr,
      vnp_CreateDate
    };

    // Sắp xếp theo key alphabet
    const sortedKeys = Object.keys(vnp_Params).sort();
    const signData = sortedKeys.map(key => `${key}=${vnp_Params[key]}`).join("&");

    const secureHash = crypto.createHmac("sha512", vnp_HashSecret).update(signData).digest("hex");
    vnp_Params["vnp_SecureHash"] = secureHash;

    const queryString = Object.keys(vnp_Params)
      .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join("&");

    const paymentUrl = `${vnp_Url}?${queryString}`;

    // Lưu payment record
    await Payment.create({
      orderId: order._id,
      paymentMethod: "VNPAY",
      transactionId: vnp_TxnRef,
      amount: data.amount,
      payUrl: paymentUrl,
      status: "PENDING",
      rawResponse: vnp_Params,
    });

    return paymentUrl;
  }
}
