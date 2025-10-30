import mongoose, { Types } from "mongoose";

/**
 * Interface representing a user's shopping cart in the system.
 *
 * ## Fields
 * - \_id: `Types.ObjectId`
 *   - Unique identifier for the cart.
 * - userId: `Types.ObjectId`
 *   - Reference to the user who owns this cart.
 * - items: Array of cart items
 *   - productId: `Types.ObjectId`
 *     - Reference to the product added to the cart.
 *   - quantity: `number`
 *     - Number of units of the product in the cart.
 * - updatedAt: `Date`
 *   - Timestamp of the last cart update (e.g., item added/removed).
 */
export interface Cart {
  _id: Types.ObjectId;
  items: {
    productId: Types.ObjectId;
    quantity: number;
  }[];
  updatedAt: Date;
  userId: Types.ObjectId;
}
