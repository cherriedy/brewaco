import { Page } from "#interfaces/page.interface.js";

import { Product } from "../../models/product.model.js";

/**
 * Represents a simplified product listing with only essential information
 * for UI display. This is used for both public and protected list endpoints.
 */
export interface ProductSummary {
  _id: string;
  categoryId: string;
  discount: number;
  images: string[];
  name: string;
  price: number;
  ratingsAverage: number;
  ratingsCount: number;
  slug: string;
  stock: number;
  type: string;
}

export class GetProductsService {
  /**
   * Fetches a paginated list of products from the database.
   *
   * Returns only essential product information for UI display.
   * Products are sorted by the specified field and order.
   * Supports pagination via `page` and `pageSize` parameters.
   *
   * @param page - Zero-based index of the page to retrieve.
   * @param pageSize - Number of products per page.
   * @param sortOrder - Sort order: 1 for ascending, -1 for descending. Defaults to -1.
   * @param sortBy - Field to sort the products by. Defaults to "updatedAt".
   * @returns Promise resolving to a paginated result containing products and metadata.
   */
  async getProducts(
    page = 0,
    pageSize: number,
    sortOrder: -1 | 1 = -1,
    sortBy = "updatedAt",
  ): Promise<Page<ProductSummary>> {
    const products = await Product.find()
      .select(
        "_id name slug categoryId price discount stock images type ratingsAverage ratingsCount",
      )
      .populate("categoryId", "name slug")
      .sort({ [sortBy]: sortOrder })
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();

    const total = await Product.countDocuments();
    const totalPage = total > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      items: products as any,
      page,
      pageSize,
      total,
      totalPages: totalPage,
    };
  }
}
