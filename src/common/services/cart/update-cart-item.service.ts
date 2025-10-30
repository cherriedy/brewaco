import { Cart } from "#common/models/cart.model.js";
import { UpdateCartItemPayload } from "#common/models/validation/cart.validation.js";
import mongoose, { Types } from "mongoose";

export class UpdateCartItemService {
  /**
   * Updates the quantity of a specific item in the user's cart.
   * - Converts userId and productId to ObjectId and validates them.
   * - If the cart does not exist, creates a new cart with the item (if quantity > 0).
   * - If the item exists, updates its quantity or removes it if quantity is 0.
   * - If the item does not exist and quantity > 0, adds it to the cart.
   * - Returns the updated cart object.
   * @param userId - The user's id (string)
   * @param data - The payload containing item info (productId, quantity)
   * @returns The updated cart document
   * @throws Error if userId or productId is invalid
   */
  async updateCartItem(userId: string, data: UpdateCartItemPayload) {
    let _userId: Types.ObjectId;
    let productId: Types.ObjectId;

    try {
      _userId = new Types.ObjectId(userId);
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.CastError) {
        throw new Error("INVALID_USER_ID");
      }
      throw error;
    }

    try {
      productId = new Types.ObjectId(data.item.productId);
    } catch (error: unknown) {
      if (error instanceof mongoose.Error.CastError) {
        throw new Error("INVALID_PRODUCT_ID");
      }
      throw error;
    }

    // Prepare the item object with ObjectId
    const item = { ...data.item, productId };

    // Find the user's cart
    let cart = await Cart.findOne({ userId: _userId });

    // If no cart exists, create a new one with the item
    if (!cart) {
      cart = new Cart({
        items: [item], // Add the item as the first entry
        userId: _userId,
      });
      await cart.save(); // Save the new cart
      return cart;
    }

    // Find the index of the item in the cart
    const itemIndex = cart.items.findIndex((cartItem) =>
      cartItem.productId.equals(productId),
    );

    // If item does not exist in cart
    if (itemIndex === -1) {
      if (item.quantity !== 0) cart.items.push(item); // Add if quantity > 0
    } else {
      // If item exists in cart
      if (item.quantity === 0) {
        cart.items.splice(itemIndex, 1); // Remove if quantity is 0
      } else {
        cart.items[itemIndex].quantity = item.quantity; // Update quantity
      }
    }

    await cart.save(); // Save the updated cart
    return cart; // Return the updated cart
  }
}
