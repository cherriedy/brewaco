import { BaseReviewService } from "#common/services/review/base-review.service.js";
import { reviewConfig } from "#config/app.js";
import mongoose from "mongoose";

import { Review } from "../../models/review.model.js";

export class DeleteReviewService extends BaseReviewService {
  /**
   * Deletes an existing review with time restriction.
   *
   * Process:
   * 1. Validates that reviewId is valid MongoDB ObjectIds.
   * 2. Finds the review and checks ownership.
   * 3. Checks if the review is still within the allowed deletion period.
   * 4. Deletes the review.
   * 5. Recalculates and updates the product's ratingsAverage and ratingsCount.
   *
   * @param userId - The ID of the user deleting the review
   * @param reviewId - The ID of the review to delete
   * @returns Promise<void> - Resolves on successful deletion.
   * @throws Error if validation fails, review doesn't exist, user is not owner, or time period expired.
   */
  async deleteReview(userId: string, reviewId: string): Promise<void> {
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

    // Check if review is within allowed deletion period
    const now = new Date();
    const createdAt = new Date(review.createdAt);

    // Convert hours to milliseconds
    const allowedPeriodMs = reviewConfig.delete.allowedPeriod * 60 * 60 * 1000;
    const timeSinceCreation = now.getTime() - createdAt.getTime();
    if (timeSinceCreation > allowedPeriodMs) {
      throw new Error("REVIEW_DELETE_PERIOD_EXPIRED");
    }

    // Store productId before deletion
    const productId = review.productId.toString();

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update product ratings
    await this.updateProductRatings(productId);
  }
}
