import { UpdateOrderStatusPayload } from "#common/models/validation/order.validation.js";
import { Types } from "mongoose";
import { Order } from "../../models/order.model.js";

export class UpdateOrderStatusService {
  // Validate status transitions
  private validTransitions: Record<string, string[]> = {
    PENDING: ["CONFIRM", "CANCELLED"],
    CONFIRM: ["SHIPPING", "CANCELLED"],
    SHIPPING: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  // Map orderStatus => timestamp field
  private statusTimestamps: Record<string, keyof typeof Order.schema.paths> = {
    CONFIRM: "confirmedTimestamp",
    SHIPPING: "shippingTimestamp",
    DELIVERED: "deliveredTimestamp",
    CANCELLED: "cancelledTimestamp",
  };

  async updateOrderStatus(orderId: string, data: UpdateOrderStatusPayload) {
    const order = await Order.findById(new Types.ObjectId(orderId));
    if (!order) throw new Error("ORDER_NOT_FOUND");

    if (!order.orderStatus) {
      throw new Error("ORDER_INVALID_STATUS");
    }

    const allowed = this.validTransitions[order.orderStatus];
    if (!allowed.includes(data.orderStatus)) throw new Error("ORDER_INVALID_STATUS_TRANSITION");

    order.orderStatus = data.orderStatus;

    // Cập nhật timestamp tương ứng
    const timestampField = this.statusTimestamps[data.orderStatus];
    if (timestampField) {
      order.set(timestampField  as string, new Date());
    }

    await order.save();
    return order;
  }
}