import { Product } from "#common/models/product.model.js";
import { Review } from "#common/models/review.model.js";
import mongoose from "mongoose";

export abstract class BaseReviewService {
  /**
   * Recalculates and updates a product's average rating and total number of ratings
   * by aggregating all associated reviews in the database.
   *
   * @param productId - The unique identifier of the product whose ratings need updating.
   */
  protected async updateProductRatings(productId: string): Promise<void> {
    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          numRatings: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      // Reviews still exist for this product
      await Product.findByIdAndUpdate(productId, {
        ratingsAverage: Math.round(stats[0].avgRating * 10) / 10,
        ratingsCount: stats[0].numRatings,
      });
    } else {
      // No reviews left, reset to 0
      await Product.findByIdAndUpdate(productId, {
        ratingsAverage: 0,
        ratingsCount: 0,
      });
    }
  }
}
