import { Product } from "#common/models/product.model.js";
import { Page } from "#interfaces/page.interface.js";

export class GetProductsByCategoryService {
  async getProductsByCategory(
    page = 0,
    pageSize: number,
    sortOrder: -1 | 1 = -1,
    sortBy = "updatedAt",
    categoryId: string
  ): Promise<Page<any>> {
    const filter: any = { categoryId };

    const products = await Product.find(filter)
      .select("_id name slug categoryId price discount stock images type ratingsAverage ratingsCount")
      .populate("categoryId", "name slug")
      .populate("typeId", "name slug")
      .sort({ [sortBy]: sortOrder })
      .skip(page * pageSize)
      .limit(pageSize)
      .lean();

    const total = await Product.countDocuments(filter);
    return { items: products, page, pageSize, total, totalPages: total > 0 ? Math.ceil(total / pageSize) : 1 };
  }
}
