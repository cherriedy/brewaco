import { UpdateReviewPayload } from "#common/models/validation/review.validation.js";
import { BaseReviewService } from "#common/services/review/base-review.service.js";
import { reviewConfig } from "#config/app.js";
import mongoose from "mongoose";

import { Review } from "../../models/review.model.js";

export class UpdateReviewService extends BaseReviewService {
  /**
   * Updates an existing review with time restriction.
   *
   * Process:
   * 1. Validates that reviewId is valid MongoDB ObjectIds.
   * 2. Finds the review and checks ownership.
   * 3. Checks if the review is still within the allowed update period.
   * 4. Updates the review.
   * 5. Recalculates and updates the product's ratingsAverage and ratingsCount.
   *
   * @param userId - The ID of the user updating the review
   * @param reviewId - The ID of the review to update
   * @param data - Object containing updated review details:
   *   - `rating` (number): Rating value (1-5)
   *   - `comment` (string): Review comment text
   * @returns Promise<Review> - Resolves with the updated review instance on success.
   * @throws Error if validation fails, review doesn't exist, user is not owner, or time period expired.
   */
  async updateReview(
    userId: string,
    reviewId: string,
    data: UpdateReviewPayload,
  ) {
    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      throw new Error("INVALID_REVIEW_ID");
    }

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error("REVIEW_NOT_FOUND");
    }

    // Check ownership
    if (review.userId.toString() !== userId) {
      throw new Error("REVIEW_NOT_OWNED");
    }

    // Check if review is within allowed update period
    const now = new Date();
    const createdAt = new Date(review.createdAt);

    // Convert hours to milliseconds
    const allowedPeriodMs = reviewConfig.update.allowedPeriod * 60 * 60 * 1000;
    const timeSinceCreation = now.getTime() - createdAt.getTime();
    if (timeSinceCreation > allowedPeriodMs) {
      throw new Error("REVIEW_UPDATE_PERIOD_EXPIRED");
    }

    // Update the review
    if (typeof data.rating !== "undefined") review.rating = data.rating!;
    if (typeof data.comment !== "undefined") review.comment = data.comment!;
    await review.save();

    // Update product ratings
    await this.updateProductRatings(review.productId.toString());

    return review;
  }
}
