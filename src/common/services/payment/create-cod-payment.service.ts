import { Order } from "#common/models/order.model.js";
import { Payment } from "#common/models/payment.model.js";
import { CreatePaymentPayload } from "#common/models/validation/payment.validation.js";

export class CreateCodPaymentService {
  static async execute(data: CreatePaymentPayload) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const payment = await Payment.create({
      orderId: order._id,
      paymentMethod: "COD",
      amount: data.amount,
      status: "PENDING"
    });

    return {
      message: "COD payment created",
      paymentId: payment._id,
    };
  }
}
