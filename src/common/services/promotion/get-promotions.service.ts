import { pagingConfig } from "#config/app.js";
import { Page } from "#interfaces/page.interface.js";
import { Promotion as IPromotion } from "#interfaces/promotion.interface.js";

import { Promotion } from "../../models/promotion.model.js";

export class GetPromotionsService {
  /**
   * Retrieves a paginated list of promotions with optional filtering.
   *
   * @param page - The page number to retrieve (1-indexed).
   * @param limit - The number of items per page.
   * @param active - Optional filter for active/inactive promotions.
   * @returns Promise<Page<IPromotion>> - Resolves with paginated promotions.
   */
  async getPromotions(
    page = 1,
    limit = pagingConfig.pageSize,
    active?: boolean,
  ): Promise<Page<IPromotion>> {
    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {};
    if (active !== undefined) {
      filter.active = active;
    }

    const [items, totalItems] = await Promise.all([
      Promotion.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Promotion.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      page: page,
      pageSize: limit,
      total: totalItems,
      totalPages: totalPages,
    };
  }
}
