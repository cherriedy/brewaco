import { Order } from "#common/models/order.model.js";
import { reviewConfig } from "#config/app.js";

export const ALLOWED_ORDER_STATUS = reviewConfig.status.allowed;

export class HasPurchasedService {
  /**
   * Checks if a user has purchased a specific product.
   *
   * @param userId - The unique identifier of the user.
   * @param productId - The unique identifier of the product.
   * @returns A promise that resolves to `true` if an order exists for the user with the given product and an allowed status; otherwise, `false`.
   */
  async invoke(userId: string, productId: string): Promise<boolean> {
    const order = await Order.findOne({
      "items.productId": productId,
      status: { $in: ALLOWED_ORDER_STATUS },
      userId,
    })
      .lean()
      .select("_id");

    return Boolean(order);
  }
}
