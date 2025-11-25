import { UpdateOrderStatusPayload } from "#common/models/validation/order.validation.js";
import { Types } from "mongoose";
import { Order } from "../../models/order.model.js";

export class UpdateOrderStatusService {
  // Validate status transitions
  private validTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["SHIPPING"],
    SHIPPING: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  // Map status => timestamp field
  private statusTimestamps: Record<string, keyof typeof Order.schema.paths> = {
    CONFIRMED: "confirmedTimestamp",
    SHIPPING: "shippingTimestamp",
    DELIVERED: "deliveredTimestamp",
    CANCELLED: "cancelledTimestamp",
  };

  async updateOrderStatus(orderId: string, data: UpdateOrderStatusPayload) {
    const order = await Order.findById(new Types.ObjectId(orderId));
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (!order.status) {
      throw new Error("ORDER_INVALID_STATUS");
    }
    if (data.status) {
      const allowed = this.validTransitions[order.status];
      if (!allowed.includes(data.status)) throw new Error("ORDER_INVALID_STATUS_TRANSITION");

      order.status = data.status;

      // Cập nhật timestamp tương ứng
      const timestampField = this.statusTimestamps[data.status];
      if (timestampField) {
        order.set(timestampField as string, new Date());
      }
    }
    await order.save();
    return order;
  }
}