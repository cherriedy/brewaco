import { GetOrdersQuery } from "#common/models/validation/order.validation.js";

import { Order } from "../../models/order.model.js";

export class GetAllOrdersService {
  /**
   * Gets all orders (admin only) with pagination and filtering.
   *
   * @param query - Query parameters for filtering and pagination.
   * @returns Promise<Object> - Orders with pagination info.
   */
  async getAllOrders(query: GetOrdersQuery) {
    const { limit, page, sortBy, sortOrder, status } = query;

    const filter: any = {};
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
        .populate("userId", "name email phone")
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
