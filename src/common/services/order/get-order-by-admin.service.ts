import { Payment } from "#common/models/payment.model.js";
import { Types } from "mongoose";
import { Order } from "../../models/order.model.js";

export class GetOrderByIdForAdminService {
  /**
   * Gets a specific order by ID for an admin.
   *
   * @param orderId - The ID of the order.
   * @returns Promise<Order> - The order details.
   * @throws Error if order not found or unauthorized.
   */
  async getOrderById(orderId: string) {
    const order = await Order.findById(orderId).populate(
      "items.productId", "name images slug price"
    );
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
