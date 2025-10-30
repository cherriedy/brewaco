import { pagingConfig } from "#config/app.js";
import { Category as ICategory } from "#interfaces/category.interface.js";
import { Page } from "#interfaces/page.interface.js";

import { Category } from "../../models/category.model.js";

export class GetCategoriesService {
  /**
   * Fetches a paginated list of categories from the database.
   *
   * Categories are sorted by their last update time in descending order.
   * Supports pagination via `page` and `pageSize` parameters.
   *
   * @param page - Zero-based index of the page to retrieve.
   * @param pageSize - Number of categories per page.
   * @param sortBy - Field to sort the categories by. Defaults to "updatedAt".
   * @param sortOrder - Sort order: 1 for ascending, -1 for descending. Defaults to -1.
   * @returns Promise resolving to a paginated result containing categories and metadata.
   */
  async getCategories(
    page = 0,
    pageSize: number,
    sortOrder: -1 | 1 = -1,
    sortBy: keyof ICategory = "updatedAt",
  ): Promise<Page<ICategory>> {
    const categories = await Category.find()
      .sort({ [sortBy]: sortOrder })
      .skip(page * pageSize) // Zero-based page index
      .limit(pageSize);

    const total = await Category.countDocuments();
    const totalPage = total > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      items: categories,
      page,
      pageSize,
      total,
      totalPage,
    } as Page<ICategory>;
  }
}
