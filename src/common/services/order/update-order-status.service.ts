import { UpdateOrderStatusPayload } from "#common/models/validation/order.validation.js";
import { Types } from "mongoose";
import { Order } from "../../models/order.model.js";

export class UpdateOrderStatusService {
  // Validate status transitions
  private validTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPING", "CANCELLED"],
    SHIPPING: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  private validPaymentTransitions: Record<string, string[]> = {
    PENDING: ["PAID", "FAILED"],
    PAID: [],
    FAILED: [],
  };

  // Map orderStatus => timestamp field
  private statusTimestamps: Record<string, keyof typeof Order.schema.paths> = {
    CONFIRMED: "confirmedTimestamp",
    SHIPPING: "shippingTimestamp",
    DELIVERED: "deliveredTimestamp",
    CANCELLED: "cancelledTimestamp",
  };

  // Map paymentStatus => timestamp field
  private paymentStatusTimestamps: Record<string, keyof typeof Order.schema.paths> = {
    PAID: "paidTimestamp",
    FAILED: "failedTimestamp"
  };

  async updateOrderStatus(orderId: string, data: UpdateOrderStatusPayload) {
    const order = await Order.findById(new Types.ObjectId(orderId));
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (!order.orderStatus) {
      throw new Error("ORDER_INVALID_STATUS");
    }
    if (data.orderStatus) {
      const allowed = this.validTransitions[order.orderStatus];
      if (!allowed.includes(data.orderStatus)) throw new Error("ORDER_INVALID_STATUS_TRANSITION");

      order.orderStatus = data.orderStatus;

      // Cập nhật timestamp tương ứng
      const timestampField = this.statusTimestamps[data.orderStatus];
      if (timestampField) {
        order.set(timestampField as string, new Date());
      }
    }
    if (data.paymentStatus && order.paymentStatus) {
      const allowedPayment = this.validPaymentTransitions[order.paymentStatus];
      if (!allowedPayment.includes(data.paymentStatus)) throw new Error("PAYMENT_INVALID_STATUS_TRANSITION");

      if (data.paymentStatus) {
        order.paymentStatus = data.paymentStatus;
      }
      // Cập nhật timestamp tương ứng
      const timestampField = this.paymentStatusTimestamps[data.paymentStatus];
      if (timestampField) {
        order.set(timestampField as string, new Date());
      }
    }
    await order.save();
    return order;
  }
}