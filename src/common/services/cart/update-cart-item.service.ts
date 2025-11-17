import { Cart } from "#common/models/cart.model.js";
import { Cart as ICart } from "#interfaces/cart.interface.js";
import { Product } from "#common/models/product.model.js";
import { UpdateCartItemPayload } from "#common/models/validation/cart.validation.js";
import mongoose, { Types } from "mongoose";

export class UpdateCartItemService {
  async updateCartItem(
    userId: string,
    data: UpdateCartItemPayload
  ): Promise<ICart> {
    let _userId: Types.ObjectId;
    let productId: Types.ObjectId;

    try {
      _userId = new Types.ObjectId(userId);
    } catch {
      throw new Error("INVALID_USER_ID");
    }

    try {
      productId = new Types.ObjectId(data.item.productId);
    } catch {
      throw new Error("INVALID_PRODUCT_ID");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    const item = { ...data.item, productId };

    let cart = await Cart.findOne({ userId: _userId });

    if (!cart) {
      cart = new Cart({
        userId: _userId,
        items: [item],
      });
      await cart.save();
      return cart;
    }

    const index = cart.items.findIndex((i) =>
      i.productId.equals(productId)
    );

    if (index === -1) {
      if (item.quantity > 0) cart.items.push(item);
    } else {
      if (item.quantity === 0) {
        cart.items.splice(index, 1);
      } else {
        cart.items[index].quantity = item.quantity;
      }
    }

    await cart.save();
    return cart;
  }
}
