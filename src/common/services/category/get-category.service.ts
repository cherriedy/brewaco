import mongoose from "mongoose";

import { Category } from "../../models/category.model.js";

export class GetCategoryService {
  /**
   * Retrieves a single category by its unique identifier.
   *
   * This method queries the database for a category document matching the provided ID.
   * If the category is found, it is returned. If not, an error is thrown indicating
   * that the category does not exist.
   *
   * @param id - The unique identifier of the category to retrieve.
   * @returns Promise<Category> - Resolves with the category instance if found.
   * @throws Error - Throws "CATEGORY_NOT_FOUND" if no category matches the given ID.
   * @throws Error - Throws "INVALID_CATEGORY_ID" if the provided ID is not a valid MongoDB ObjectId.
   */
  async getCategory(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_CATEGORY_ID");
    }
    const category = await Category.findById(id);
    if (!category) throw new Error("CATEGORY_NOT_FOUND");
    return category;
  }
}
