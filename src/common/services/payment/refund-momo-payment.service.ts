import crypto from "crypto";
import axios from "axios";
import { Payment } from "#common/models/payment.model.js";
import { Order } from "#common/models/order.model.js";

const partnerCode = process.env.MOMO_PARTNER_CODE!;
const accessKey = process.env.MOMO_ACCESS_KEY!;
const secretKey = process.env.MOMO_SECRET_KEY!;

export class RefundMomoPaymentService {
  static async execute(paymentId: string) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");
    if (payment.paymentMethod !== "MOMO") throw new Error("INVALID_PAYMENT_METHOD");
    if (payment.status !== "PAID") throw new Error("PAYMENT_NOT_PAID");

    const order = await Order.findById(payment.orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (order.status !== "CANCELLED") {
      throw new Error("ORDER_NOT_CANCELLED");
    }

    const requestId = `${payment._id}_${Date.now()}`;
    const amount = Number(payment.amount)!;
    const orderId = `${payment.orderId}_${Date.now()}`;

    const rawSignature =
      `accessKey=${accessKey}&amount=${amount}&description=Refund test` +
      `&orderId=${orderId}&partnerCode=${partnerCode}` +
      `&requestId=${requestId}&transId=${payment.transactionId}`;

    const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

    const requestBody = {
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      transId: payment.transactionId,
      lang: "vi",
      description: "Refund test",
      signature,
    };
    const response = await axios.post("https://test-payment.momo.vn/v2/gateway/api/refund", requestBody);

    if (response.data.resultCode === 0) {
      payment.status = "REFUNDED";
      payment.refundedTimestamp = new Date();
      payment.rawResponse = response.data;
      await payment.save();

      return { message: "Refund successful", data: response.data };
    } else {
      throw new Error(`Refund failed: ${response.data.message || response.data.localMessage}`);
    }
  }
}
