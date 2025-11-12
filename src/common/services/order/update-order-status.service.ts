import { UpdateOrderStatusPayload } from "#common/models/validation/order.validation.js";
import { Types } from "mongoose";

import { Order } from "../../models/order.model.js";

export class UpdateOrderStatusService {
  // Validate status transitions
  private validTransitions: Record<string, string[]> = {
    CANCELED: [],
    CREATED: ["PAID", "CANCELED"],
    DELIVERED: [],
    PAID: ["SHIPPED", "CANCELED"],
    SHIPPED: ["DELIVERED", "CANCELED"],
  };

  /**
   * Updates the status of an order.
   *
   * @param orderId - The ID of the order.
   * @param data - The status update payload.
   * @returns Promise<Order> - The updated order.
   * @throws Error if order not found or invalid status transition.
   */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusPayload) {
    const order = await Order.findById(new Types.ObjectId(orderId));

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const allowedStatuses = this.validTransitions[order.status];
    if (!allowedStatuses.includes(data.status)) {
      throw new Error("ORDER_INVALID_STATUS_TRANSITION");
    }

    order.status = data.status;
    await order.save();

    return order;
  }
}
