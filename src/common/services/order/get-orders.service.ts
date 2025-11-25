import { GetOrdersQuery } from "#common/models/validation/order.validation.js";
import { Types } from "mongoose";

import { Order } from "../../models/order.model.js";

export class GetOrdersService {
  /**
   * Gets all orders for a user with pagination and filtering.
   *
   * @param userId - The ID of the user.
   * @param query - Query parameters for filtering and pagination.
   * @returns Promise<Object> - Orders with pagination info.
   */
  async getOrders(userId: string, query: GetOrdersQuery) {
    const { limit, page, sortBy, sortOrder, status } = query;

    const filter: any = { userId: new Types.ObjectId(userId) };
    if (status) {
      filter.status = status;
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const skip = page * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("items.productId", "name images slug"),
      Order.countDocuments(filter),
    ]);

    return {
      data: orders,
      pagination: {
        limit,
        page,
        total,
        totalPages: total > 0 ? Math.ceil(total / limit) : 1,
      },
    };
  }
}
