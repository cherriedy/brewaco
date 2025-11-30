import { Payment } from "#common/models/payment.model.js";
import { Order } from "#common/models/order.model.js";
import { CreatePaymentPayload } from "#common/models/validation/payment.validation.js";
import MomoGateway from "#gateway/payment/momo.gateway.js";

export class CreateMomoPaymentService {
  static async execute(data: CreatePaymentPayload) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const momoGateway = new MomoGateway();
    const { redirectUrl } = await momoGateway.createPayment(
      order._id.toString(),
      data.amount ?? 0, // Default to 0 if undefined
      {
        orderInfo: `Thanh toán đơn hàng #${order._id}`,
        extraData: "",
      },
    );

    await Payment.create({
      orderId: order._id,
      paymentMethod: "MOMO",
      amount: data.amount,
      payUrl: redirectUrl,
      status: "PENDING",
    });

    return redirectUrl;
  }
}
