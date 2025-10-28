import { Category } from "../../models/category.model.js";
import { UpdateCategoryPayload } from "#common/models/validation/category.validation.js";

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
    const category = await Category.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    return category;
  }
}
