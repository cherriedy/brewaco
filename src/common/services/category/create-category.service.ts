import { Category } from "../../models/category.model.js";
import {
  CreateCategoryPayload,
  createCategorySchema,
} from "#common/models/validation/category.validation.js";

export class CreateCategoryService {
  /**
   * Creates a new category in the database.
   *
   * Process:
   * 1. Validates input data using the Zod schema for required fields and types.
   * 2. Checks if a category with the same name already exists to ensure uniqueness.
   * 3. Persists the new category if validation and uniqueness checks pass.
   *
   * @param data - Object containing category details. Requires:
   *   - `name` \(`string`\): The unique name of the category.
   *   - Optional:
   *     - `slug` \(`string`\): URL-friendly identifier for the category.
   *     - `description` \(`string`\): Brief description of the category.
   * @returns Promise<Category> - Resolves with the newly created category instance on success.
   * @throws Error if validation fails or the category name already exists.
   */
  async createCategory(data: CreateCategoryPayload) {
    // Check if category with same name already exists
    const existing = await Category.findOne({ name: data.name });
    if (existing) throw new Error("CATEGORY_ALREADY_EXISTS");

    const category = new Category(data);
    await category.save();
    return category;
  }
}
