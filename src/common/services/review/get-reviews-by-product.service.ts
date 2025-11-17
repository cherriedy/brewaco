import { pagingConfig } from "#config/app.js";
import { Page } from "#interfaces/page.interface.js";
import { Review as IReview } from "#interfaces/review.interface.js";

import { Review } from "../../models/review.model.js";

export class GetReviewsService {
  /**
   * Lấy danh sách review theo productId với phân trang
   *
   * @param productId - ID sản phẩm
   * @param page - Trang hiện tại (mặc định 1)
   * @param limit - Số item/trang (mặc định pagingConfig.pageSize)
   * @returns Promise<Page<IReview>>
   */
  async getReviewsByProductId(
    productId: string,
    page = 1,
    limit = pagingConfig.pageSize,
  ): Promise<Page<IReview>> {
    const skip = (page - 1) * limit;

    // Validate ObjectId
    if (!Review.db.base.Types.ObjectId.isValid(productId)) {
      throw new Error("INVALID_PRODUCT_ID");
    }

    const filter = { productId };

    const [items, totalItems] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "_id name email") 
        .populate("productId", "_id name slug") 
        .populate("orderId", "_id orderStatus createdAt") 
        .lean(),
      Review.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      page,
      pageSize: limit,
      total: totalItems,
      totalPages,
    };
  }
}
