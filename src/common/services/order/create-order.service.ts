import { CreateOrderPayload } from "#common/models/validation/order.validation.js";
import { Types } from "mongoose";

import { Cart } from "../../models/cart.model.js";
import { Order } from "../../models/order.model.js";
import { Product } from "../../models/product.model.js";

export class CreateOrderService {
  /**
   * Creates a new order for a user.
   *
   * @param userId - The ID of the user creating the order.
   * @param data - The order creation payload.
   * @returns Promise<Order> - The created order.
   * @throws Error if validation fails or products are unavailable.
   */
  async invoke(userId: string, data: CreateOrderPayload) {
    // Validate product availability and stock
    const productIds = data.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      throw new Error("ORDER_INVALID_PRODUCTS");
    }

    // Check stock availability
    for (const item of data.items) {
      const product = products.find(
        (p) => p._id?.toString() === item.productId,
      );
      if (!product) {
        throw new Error("ORDER_PRODUCT_NOT_FOUND");
      }
      if (product.stock < item.quantity) {
        throw new Error("ORDER_INSUFFICIENT_STOCK");
      }
    }

    // Create the order
    const order = new Order({
      items: data.items.map((item) => ({
        name: item.name,
        price: item.price,
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
      })),
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      promotionCode: data.promotionCode,
      shippingAddress: data.shippingAddress,
      status: "CREATED",
      totalAmount: data.totalAmount,
      userId: new Types.ObjectId(userId),
    });

    await order.save();

    // Update product stock
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart after successful order, only remove the items that were ordered from the cart
    const productObjectIds = productIds.map((id) => new Types.ObjectId(id));
    await Cart.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $pull: { items: { productId: { $in: productObjectIds } } } },
    );

    return order;
  }
}
