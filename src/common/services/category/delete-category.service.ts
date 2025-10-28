import { Category } from "../../models/category.model.js";

export class DeleteCategoryService {
  /**
   * Deletes a category from the database using its unique identifier.
   * Throws an error if the category does not exist.
   *
   * @param id - The unique identifier of the category to delete.
   * @returns Promise resolving to the deleted category document.
   */
  async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new Error("CATEGORY_NOT_FOUND");
    return category;
  }
}
