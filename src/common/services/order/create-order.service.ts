import { CreateOrderPayload } from "#common/models/validation/order.validation.js";
import { Types } from "mongoose";

import { Cart } from "../../models/cart.model.js";
import { Order } from "../../models/order.model.js";
import { Product } from "../../models/product.model.js";

export class CreateOrderService {
  async invoke(userId: string, data: CreateOrderPayload) {
    const productIds = data.items.map((i) => i.productId);

    // Fetch products
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      throw new Error("ORDER_INVALID_PRODUCTS");
    }

    // Check stock
    for (const item of data.items) {
      const product = products.find(
        (p) => p._id.toString() === item.productId
      );
      if (!product) throw new Error("ORDER_PRODUCT_NOT_FOUND");
      if (product.stock < item.quantity) throw new Error("ORDER_INSUFFICIENT_STOCK");
    }

    // Create order
    const order = new Order({
      userId: new Types.ObjectId(userId),
      items: data.items.map((item) => ({
        productId: new Types.ObjectId(item.productId),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        images: item.images || [],
      })),
      totalAmount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      shippingAddress: data.shippingAddress,
      promotionCode: data.promotionCode || "",
      discountAmount: data.discountAmount || 0,
      note: data.note || "",
    });

    await order.save();

    // Update stock
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Remove ordered items from user's cart
    const objectIds = productIds.map((id) => new Types.ObjectId(id));
    await Cart.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $pull: { items: { productId: { $in: objectIds } } } }
    );

    return order;
  }
}
