import { Payment } from "#common/models/payment.model.js";
import { Order } from "#common/models/order.model.js";
import MomoGateway from "#gateway/payment/momo.gateway.js";

export class RefundMomoPaymentService {
  static async execute(paymentId: string) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error("PAYMENT_NOT_FOUND");
    if (payment.paymentMethod !== "MOMO")
      throw new Error("INVALID_PAYMENT_METHOD");
    if (payment.status !== "PAID") throw new Error("PAYMENT_NOT_PAID");

    const order = await Order.findById(payment.orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (order.status !== "CANCELLED") {
      throw new Error("ORDER_NOT_CANCELLED");
    }

    const momoGateway = new MomoGateway();
    const success = await momoGateway.refundPayment(
      payment.transactionId as string,
      Number(payment.amount),
    );

    if (success) {
      payment.status = "REFUNDED";
      payment.refundedTimestamp = new Date();
      // Optionally, you may want to store the raw response if needed
      await payment.save();
      return { message: "Refund successful" };
    } else {
      throw new Error("Refund failed");
    }
  }
}
