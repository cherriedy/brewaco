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

    // đảm bảo orderStatus luôn có giá trị
    const currentStatus = order.status || "PENDING";

    // Chỉ cho phép hủy khi trạng thái là PENDING hoặc CONFIRMED
    if (!["PENDING", "CONFIRMED"].includes(currentStatus)) {
      throw new Error("ORDER_CANNOT_BE_CANCELLED");
    }

    // Khôi phục số lượng sản phẩm
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity },
      });
    }

    order.status = "CANCELLED";
    order.cancelledTimestamp = new Date(); 
    await order.save();

    return order;
  }
}
