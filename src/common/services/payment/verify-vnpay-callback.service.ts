import { VNPayGateway } from "#gateway/payment/vnpay.gateway.js";
import { Payment } from "#common/models/payment.model.js";
import { Order } from "#common/models/order.model.js";
import logger from "#common/utils/logger.js";

export class VerifyVnpayCallbackService {
  static async execute(query: Record<string, string>) {
    const gateway = new VNPayGateway();

    const result = await gateway.verifyPayment({ ...query });
    logger.info("VNPay callback verification result:", result);
    if (result.status === "FAILED") {
      throw new Error("INVALID_VNPAY_SIGNATURE");
    }

    const payment = await Payment.findOne({
      transactionId: query["vnp_TxnRef"],
    });
    if (!payment) {
      logger.error(
        "Payment not found for VNPay callback:",
        query["vnp_TxnRef"],
      );
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const orderId = payment.orderId;

    if (result.status === "PAID") {
      // Thanh toán thành công
      payment.status = "PAID";
      payment.paidTimestamp = new Date();
      payment.rawResponse = result.rawResponse;
      await payment.save();

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "PAID",
        paidTimestamp: new Date(),
      });
    } else {
      // Thanh toán thất bại
      payment.status = "FAILED";
      payment.failedTimestamp = new Date();
      payment.rawResponse = result.rawResponse;
      await payment.save();

      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "FAILED",
        failedTimestamp: new Date(),
      });
    }
  }
}
