import { Order } from "#common/models/order.model.js";
import { reviewConfig } from "#config/app.js";

export const ALLOWED_ORDER_STATUS = reviewConfig.orderStatus.allowed;
export const ALLOWED_PAYMENT_STATUS = reviewConfig.paymentStatus.allowed;

export class HasPurchasedService {
  /**
   * Checks if a user has purchased a specific product in a specific order.
   *
   * @param userId - The unique identifier of the user.
   * @param productId - The unique identifier of the product.
   * @param orderId - The unique identifier of the order.
   * @returns A promise that resolves to `true` if an order exists for the user with the given product and allowed status; otherwise, `false`.
   */
  async invoke(userId: string, productId: string, orderId: string): Promise<boolean> {
    const order = await Order.findOne({
      _id: orderId,
      userId,
      "items.productId": productId,
      orderStatus: { $in: ALLOWED_ORDER_STATUS },
      paymentStatus: { $in: ALLOWED_PAYMENT_STATUS },
    })
      .lean()
      .select("_id");

    return Boolean(order);
  }
}
