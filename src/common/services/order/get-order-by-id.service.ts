import { Types } from "mongoose";

import { Order } from "../../models/order.model.js";
import { Payment } from "#common/models/payment.model.js";

export class GetOrderByIdService {
  /**
   * Gets a specific order by ID for a user.
   *
   * @param userId - The ID of the user.
   * @param orderId - The ID of the order.
   * @returns Promise<Order> - The order details.
   * @throws Error if order not found or unauthorized.
   */
  async getOrderById(userId: string, orderId: string) {
    const order = await Order.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
    }).populate("items.productId", "name images slug price");

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const payment = await Payment.findOne({
      orderId: new Types.ObjectId(orderId),
    });

    return {
      order,
      payment,
    };
  }
}
