import { CreateReviewPayload } from "#common/models/validation/review.validation.js";
import { BaseReviewService } from "#common/services/review/base-review.service.js";
import mongoose from "mongoose";

import { Product } from "../../models/product.model.js";
import { Review } from "../../models/review.model.js";

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
    data: CreateReviewPayload,
  ) {
    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("INVALID_PRODUCT_ID");
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      throw new Error("REVIEW_ALREADY_EXISTS");
    }

    // Create the review
    const review = new Review({
      comment: data.comment,
      productId,
      rating: data.rating,
      userId,
    });
    await review.save();

    // Update product ratings
    await this.updateProductRatings(productId);

    return review;
  }
}
