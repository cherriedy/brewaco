import { Order } from "#common/models/order.model.js";
import { Payment } from "#common/models/payment.model.js";
import { PaymentGateway } from "#gateway/payment/base.gateway.js";
import { VNPayGateway } from "#gateway/payment/vnpay.gateway.js";
import { PaymentMethod } from "#types/payment.js";
import { Types } from "mongoose";

export class CreatePaymentService {
  private readonly gateways: Map<PaymentMethod, PaymentGateway>;

  constructor() {
    this.gateways = new Map();
    this.gateways.set("VNPay", new VNPayGateway());
  }

  /**
   * Creates a payment for an order or retrieves existing pending payment
   * This allows users to retry payment if they didn't complete it initially
   * @param orderId - The order ID
   * @param userId - The user ID
   * @param metadata - Additional metadata (e.g., IP address, order info)
   * @returns Payment URL for online payment or payment record for COD
   */
  async invoke(
    orderId: string,
    userId: string,
    metadata: { ipAddr?: string; orderInfo?: string },
  ): Promise<{ isRetry: boolean; payment: any; paymentUrl?: string }> {
    // Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("PAYMENT_ORDER_NOT_FOUND");
    }

    // Verify order belongs to user
    if (order.userId.toString() !== userId) {
      throw new Error("PAYMENT_UNAUTHORIZED");
    }

    // Check if order status is valid for payment
    if (order.status !== "CREATED") {
      throw new Error("PAYMENT_INVALID_ORDER_STATUS");
    }

    // Check if there's already a pending payment (retry case)
    let pendingPayment = await Payment.findOne({
      orderId: new Types.ObjectId(orderId),
      status: "PENDING",
    });

    // For COD, no payment gateway needed
    if (order.paymentMethod === "COD") {
      // Check if payment record already exists
      if (!pendingPayment) {
        pendingPayment = new Payment({
          amount: order.totalAmount,
          orderId: new Types.ObjectId(orderId),
          provider: order.paymentMethod,
          status: "SUCCESS",
          transactionId: "COD",
          userId: new Types.ObjectId(userId),
        });
        await pendingPayment.save();
      }

      // Update order status to PAID for COD
      order.status = "PAID";
      await order.save();

      return {
        isRetry: false,
        payment: pendingPayment,
      };
    }

    // Handle online payment
    const gateway = this.gateways.get(order.paymentMethod);
    if (!gateway) {
      throw new Error("PAYMENT_GATEWAY_NOT_SUPPORTED");
    }

    // If no existing payment, create new one
    if (!pendingPayment) {
      pendingPayment = new Payment({
        amount: order.totalAmount,
        orderId: new Types.ObjectId(orderId),
        provider: order.paymentMethod,
        status: "PENDING",
        transactionId: "",
        userId: new Types.ObjectId(userId),
      });
      await pendingPayment.save();
    }

    // Generate payment URL
    const { redirectUrl } = await gateway.createPayment(
      orderId,
      order.totalAmount,
      {
        ipAddr: metadata.ipAddr,
        orderInfo: metadata.orderInfo,
      },
    );

    return {
      isRetry: !!pendingPayment && pendingPayment.createdAt < new Date(),
      payment: pendingPayment,
      paymentUrl: redirectUrl,
    };
  }
}
