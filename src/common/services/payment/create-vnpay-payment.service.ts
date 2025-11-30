import { Payment } from "#common/models/payment.model.js";
import { Order } from "#common/models/order.model.js";
import { CreatePaymentPayload } from "#common/models/validation/payment.validation.js";
import { VNPayGateway } from "#gateway/payment/vnpay.gateway.js";

export class CreateVnpayPaymentService {
  static async execute(data: CreatePaymentPayload & { ipAddr?: string }) {
    const order = await Order.findById(data.orderId);
    if (!order) throw new Error("ORDER_NOT_FOUND");

    // Prepare metadata for gateway
    const metadata = {
      ipAddr: data.ipAddr || "0.0.0.0",
      orderInfo: `Thanh toán đơn hàng #${order._id}`,
    };

    // Use VNPayGateway to create payment
    const gateway = new VNPayGateway();
    const { redirectUrl } = await gateway.createPayment(
      `${order._id}_${Date.now()}`,
      Number(data.amount!),
      metadata,
    );

    // Save payment record
    await Payment.create({
      orderId: order._id,
      paymentMethod: "VNPAY",
      transactionId: `${order._id}_${Date.now()}`,
      amount: data.amount,
      payUrl: redirectUrl,
      status: "PENDING",
      rawResponse: {},
    });

    return redirectUrl;
  }
}
