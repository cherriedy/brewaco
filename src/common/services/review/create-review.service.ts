import { CreateReviewPayload } from "#common/models/validation/review.validation.js";
import { BaseReviewService } from "#common/services/review/base-review.service.js";
import mongoose from "mongoose";

import { Product } from "../../models/product.model.js";
import { Review } from "../../models/review.model.js";
import { Order } from "#common/models/order.model.js";

export class CreateReviewService extends BaseReviewService {
  /**
   * Creates a new review for a product.
   *
   * Process:
   * 1. Validates that productId is valid MongoDB ObjectIds.
   * 2. Checks if the product exists in the database.
   * 3. Checks if the user has already reviewed this product (enforced by unique index).
   * 4. Creates and saves the review.
   * 5. Updates the product's ratingsAverage and ratingsCount.
   *
   * @param userId - The ID of the user creating the review
   * @param productId - The ID of the product being reviewed
   * @param data - Object containing review details:
   *   - `rating` (number): Rating value (1-5)
   *   - `comment` (string): Review comment text
   * @returns Promise<Review> - Resolves with the newly created review instance on success.
   * @throws Error if validation fails, product doesn't exist, or user already reviewed the product.
   */
  async createReview(
    userId: string,
    productId: string,
    orderId: string,
    data: CreateReviewPayload,
  ) {

    // Lấy order
const order = await Order.findOne({
  _id: orderId,
  userId,
  "items.productId": productId,
});
if (!order) throw new Error("ORDER_NOT_FOUND");

// Lấy đúng item
const item = order.items.find(
  (i) => i.productId.toString() === productId
);

if (!item) throw new Error("PRODUCT_NOT_IN_ORDER");

// Check item đã review chưa
if (item.isReviewed) throw new Error("REVIEW_ALREADY_EXISTS");

// Validate product
if (!mongoose.Types.ObjectId.isValid(productId)) {
  throw new Error("INVALID_PRODUCT_ID");
}

const product = await Product.findById(productId);
if (!product) throw new Error("PRODUCT_NOT_FOUND");

// Tạo review
const review = new Review({
  comment: data.comment,
  productId,
  rating: data.rating,
  userId,
  orderId,
});
await review.save();

// Đánh dấu item
item.isReviewed = true;
await order.save();

// Nếu tất cả items đã đánh giá => set order.isReviewed = true
if (order.items.every((i) => i.isReviewed)) {
  order.isReviewed = true;
  await order.save();
}

// Cập nhật rating cho product
await this.updateProductRatings(productId);

return review;

  }
}