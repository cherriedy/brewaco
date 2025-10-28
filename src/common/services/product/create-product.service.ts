import { Product } from "../../models/product.model.js";
import { CreateProductPayload } from "#common/models/validation/product.validation.js";
import mongoose from "mongoose";

export class CreateProductService {
  /**
   * Creates a new product in the database.
   *
   * Process:
   * 1. Validates input data using the Zod schema for required fields and types.
   * 2. Checks if the category exists in the database.
   * 3. Checks if a product with the same slug already exists to ensure uniqueness.
   * 4. Persists the new product if validation and uniqueness checks pass.
   *
   * @param data - Object containing product details. Requires:
   *   - `name` \(`string`\): The name of the product.
   *   - `categoryId` \(`string`\): The ID of the category this product belongs to.
   *   - `description` \(`string`\): Product description.
   *   - `price` \(`number`\): Product price (must be >= 0).
   *   - `origin` \(`string`\): Product origin.
   *   - `type` \(`string`\): Product type.
   *   - `weight` \(`string`\): Product weight.
   *   - Optional:
   *     - `slug` \(`string`\): URL-friendly identifier (auto-generated if not provided).
   *     - `discount` \(`number`\): Discount percentage (0-100).
   *     - `stock` \(`number`\): Available stock quantity.
   *     - `images` \(`string[]`\): Array of image URLs.
   * @returns Promise<Product> - Resolves with the newly created product instance on success.
   * @throws Error if validation fails, category doesn't exist, or the product slug already exists.
   */
  async createProduct(data: CreateProductPayload) {
    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
      throw new Error("INVALID_CATEGORY_ID");
    }

    // Check if product with same slug already exists (if slug is provided)
    if (data.slug) {
      const existing = await Product.findOne({ slug: data.slug });
      if (existing) throw new Error("PRODUCT_ALREADY_EXISTS");
    }

    const product = new Product(data);
    await product.save();
    return product;
  }
}
