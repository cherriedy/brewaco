import { Cart } from "#common/models/cart.model.js";
import { Types } from "mongoose";

export class GetCartItemsService {
  /**
   * Retrieves the cart for a specific user.
   *
   * Steps:
   * 1. Validates the provided `userId` string to ensure it is a valid MongoDB ObjectId.
   *    - Throws an error if the format is invalid.
   * 2. Converts the `userId` string to a `Types.ObjectId` instance for querying.
   * 3. Searches for an existing cart document associated with the user.
   *    - If no cart is found, creates a new cart with an empty items array and saves it.
   * 4. Returns the cart document, which contains all items for the user.
   *
   * @param userId - The user's unique identifier in string format.
   * @returns The user's cart document, including all cart items.
   * @throws Error if the `userId` is not a valid ObjectId string.
   */
  async getItems(userId: string) {
    // Validate userId format before converting
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("INVALID_USER_ID");
    }

    // Convert userId string to ObjectId
    const _userId = new Types.ObjectId(userId);

    // Query the database for the user's cart
    let cart = await Cart.findById(_userId).populate(
      "items.productId",
      "name price images stock",
    );
    if (!cart) {
      cart = new Cart({ items: [], userId: _userId });
      await cart.save(); // Persist the new cart to database
    }

    return cart;
  }
}
