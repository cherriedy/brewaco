import { Cart } from "#common/models/cart.model.js";
import { Cart as ICart } from "#interfaces/cart.interface.js";
import { Product } from "#common/models/product.model.js";
import { AddCartItemPayload } from "#common/models/validation/cart.validation.js";
import mongoose, { Types } from "mongoose";

export class AddCartItemService {
  async addCartItem(
    userId: string,
    data: AddCartItemPayload
  ): Promise<ICart> {
    let _userId: Types.ObjectId;
    let productId: Types.ObjectId;

    try {
      _userId = new Types.ObjectId(userId);
    } catch {
      throw new Error("INVALID_USER_ID");
    }

    try {
      productId = new Types.ObjectId(data.productId);
    } catch {
      throw new Error("INVALID_PRODUCT_ID");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    let cart = await Cart.findOne({ userId: _userId });

    // If cart does not exist, create new
    if (!cart) {
      cart = new Cart({
        userId: _userId,
        items: [{ productId, quantity: data.quantity }],
      });
      await cart.save();
      return cart;
    }

    // Check if item exists
    const index = cart.items.findIndex((i) =>
      i.productId.equals(productId)
    );

    if (index === -1) {
      cart.items.push({ productId, quantity: data.quantity });
    } else {
      cart.items[index].quantity += data.quantity;
    }

    await cart.save();
    return cart;
  }
}
