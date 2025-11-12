import { Review } from "#common/models/review.model.js";
import { pagingConfig } from "#config/app.js";
import { Page } from "#interfaces/page.interface.js";
import mongoose from "mongoose";

export class GetReviewsService {
  /**
   * Retrieves a paginated list of reviews with optional filtering.
   *
   * Supports filtering by:
   * - productId: Filter reviews for a specific product
   * - userId: Filter reviews by a specific user
   * - rating: Filter by specific rating value (1-5)
   * - minRating: Filter reviews with rating >= minRating
   * - maxRating: Filter reviews with rating <= maxRating
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: from pagingConfig.pageSize)
   * @param filters - Optional filters object
   * @returns Promise with paginated reviews and metadata
   */
  async invoke(
    page = 1,
    limit: number = pagingConfig.pageSize,
    filters: {
      maxRating?: number;
      minRating?: number;
      productId?: string;
      rating?: number;
      userId?: string;
    } = {},
  ): Promise<Page<any>> {
    // Build query conditions
    const query: any = {};

    // Filter by productId
    if (filters.productId) {
      if (!mongoose.Types.ObjectId.isValid(filters.productId)) {
        throw new Error("INVALID_PRODUCT_ID");
      }
      query.productId = new mongoose.Types.ObjectId(filters.productId);
    }

    // Filter by userId
    if (filters.userId) {
      if (!mongoose.Types.ObjectId.isValid(filters.userId)) {
        throw new Error("INVALID_USER_ID");
      }
      query.userId = new mongoose.Types.ObjectId(filters.userId);
    }

    // Filter by exact rating
    if (filters.rating !== undefined) {
      query.rating = filters.rating;
    }

    // Filter by rating range
    if (filters.minRating !== undefined || filters.maxRating !== undefined) {
      query.rating = {};
      if (filters.minRating !== undefined) {
        query.rating.$gte = filters.minRating;
      }
      if (filters.maxRating !== undefined) {
        query.rating.$lte = filters.maxRating;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate("userId", "name email")
        .populate("productId", "name slug images")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      items: reviews,
      page,
      pageSize: limit,
      total,
      totalPages,
    };
  }
}
