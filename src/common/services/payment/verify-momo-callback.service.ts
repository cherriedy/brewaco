import { Order } from "#common/models/order.model.js";
import { Payment } from "#common/models/payment.model.js";
import { MomoCallback } from "#interfaces/momo-callback.interface.js";
import MomoGateway from "#gateway/payment/momo.gateway.js";

export class VerifyMomoCallbackService {
  static async execute(data: MomoCallback) {
    const momoGateway = new MomoGateway();
    const result = await momoGateway.verifyPayment(data);

    // Lấy payment record
    const payment = await Payment.findOne({ orderId: data.orderId });
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");

    if (result.status === "PAID") {
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
