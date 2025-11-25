import crypto from "crypto";
import { Order } from "#common/models/order.model.js";
import { Payment } from "#common/models/payment.model.js";
import { MomoCallback } from "#interfaces/momo-callback.interface.js";

const accessKey = process.env.MOMO_ACCESS_KEY!;
const secretKey = process.env.MOMO_SECRET_KEY!;

export class VerifyMomoCallbackService {
  static async execute(data : MomoCallback) {
    
    const rawSignature =
      `accessKey=${accessKey}&amount=${data.amount}&extraData=${data.extraData}&message=${data.message}` +
      `&orderId=${data.orderId}&orderInfo=${data.orderInfo}&orderType=${data.orderType}&partnerCode=${data.partnerCode}` +
      `&payType=${data.payType}&requestId=${data.requestId}&responseTime=${data.responseTime}` +
      `&resultCode=${data.resultCode}&transId=${data.transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(rawSignature)
      .digest("hex");

    if (expectedSignature !== data.signature) {
      throw new Error("INVALID_MOMO_SIGNATURE");
    }

    // Lấy payment record
    const payment = await Payment.findOne({ orderId: data.orderId });
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    if (data.resultCode === 0) {
      // Thành công
      payment.status = "PAID";
      payment.paidTimestamp = new Date();
      payment.transactionId = data.transId;
      await payment.save();

      await Order.findByIdAndUpdate(data.orderId, {
        paymentStatus: "PAID",
        paidTimestamp: new Date(),
      });
    } else {
      // Thất bại
      payment.status = "FAILED";
      payment.failedTimestamp = new Date();
      payment.gatewayResponseCode = data.resultCode;
      await payment.save();

      await Order.findByIdAndUpdate(data.orderId, {
        paymentStatus: "FAILED",
        failedTimestamp: new Date(),
      });
    }

    return { message: "ok" };
  }
}
