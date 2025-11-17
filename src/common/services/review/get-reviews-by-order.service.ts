import { pagingConfig } from "#config/app.js";
import { Page } from "#interfaces/page.interface.js";
import { Review as IReview } from "#interfaces/review.interface.js";
import { Review } from "../../models/review.model.js";
import { Order } from "../../models/order.model.js";
import { Types } from "mongoose";

export class GetReviewsService {
  /**
   * Lấy danh sách review theo orderId với phân trang
   *
   * @param orderId - ID đơn hàng
   * @param userId - ID user hiện tại (đảm bảo user không xem review người khác)
   * @param page - Trang hiện tại (mặc định 1)
   * @param limit - Số item/trang (mặc định pagingConfig.pageSize)
   * @returns Promise<Page<IReview>>
   */
  async getReviewsByOrder(
    orderId: string,
    userId: string,
    page = 1,
    limit = pagingConfig.pageSize,
  ): Promise<Page<IReview>> {
    // Validate orderId
    if (!Types.ObjectId.isValid(orderId)) {
      throw new Error("INVALID_ORDER_ID");
    }

    // Check order tồn tại và thuộc user
    const order = await Order.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
    });

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      Review.find({ orderId: order._id })
        .populate("productId", "_id name images slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ orderId: order._id }),
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
