import { UpdateCategoryPayload } from "#common/models/validation/category.validation.js";
import { getSlug } from "#common/utils/text-utilities.js";

import { Category } from "../../models/category.model.js";

export class UpdateCategoryService {
  /**
   * Updates an existing category in the database.
   *
   * Finds the category by its unique identifier and applies the provided updates.
   * Ensures the update payload is validated for data integrity.
   *
   * @param id - The unique identifier of the category to update.
   * @param data - The validated update payload containing new category data.
   * @returns Promise resolving to the updated category document, or throws an error if not found.
   */
  async updateCategory(id: string, data: UpdateCategoryPayload) {
    // 1. Lấy category trước
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
    let newSlug = null;

    if (data.slug) {
      newSlug = getSlug(data.slug);
    }

    if (data.name) {
      const autoSlug = getSlug(data.name);
      newSlug = newSlug || autoSlug;
    }

    if (newSlug) {
      const exists = await Category.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      if (exists) throw new Error("CATEGORY_ALREADY_EXISTS");
      category.slug = newSlug;
    }

    if (data.name !== undefined) category.name = data.name;
    if (data.description !== undefined) category.description = data.description;

    await category.save();

    return category;
  }

}
