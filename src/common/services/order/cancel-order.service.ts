import { Types } from "mongoose";

import { Order } from "../../models/order.model.js";
import { Product } from "../../models/product.model.js";

export class CancelOrderService {
  /**
   * Cancels an order and restores product stock.
   *
   * @param userId - The ID of the user.
   * @param orderId - The ID of the order to cancel.
   * @returns Promise<Order> - The cancelled order.
   * @throws Error if order not found or cannot be cancelled.
   */
  async cancelOrder(userId: string, orderId: string) {
    const order = await Order.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    // Only allow cancellation for pending or paid orders
    if (!["CREATED", "PAID"].includes(order.status)) {
      throw new Error("ORDER_CANNOT_BE_CANCELLED");
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "CANCELED";
    await order.save();

    return order;
  }
}
