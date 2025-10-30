import { UpdateProductPayload } from "#common/models/validation/product.validation.js";
import mongoose from "mongoose";

import { Product } from "../../models/product.model.js";

export class UpdateProductService {
  /**
   * Updates an existing product in the database.
   *
   * Process:
   * 1. Validates the product ID format.
   * 2. Checks if the product exists in the database.
   * 3. If a new slug is provided, ensures it doesn't conflict with another product.
   * 4. If a new categoryId is provided, validates its format.
   * 5. Updates the product with the provided data.
   *
   * @param id - The unique identifier of the product to update.
   * @param data - Object containing fields to update. All fields are optional:
   *   - `name` \(`string`\): Updated product name.
   *   - `slug` \(`string`\): Updated URL-friendly identifier.
   *   - `categoryId` \(`string`\): Updated category ID.
   *   - `description` \(`string`\): Updated description.
   *   - `price` \(`number`\): Updated price.
   *   - `discount` \(`number`\): Updated discount percentage.
   *   - `stock` \(`number`\): Updated stock quantity.
   *   - `images` \(`string[]`\): Updated array of image URLs.
   *   - `origin` \(`string`\): Updated origin.
   *   - `type` \(`string`\): Updated type.
   *   - `weight` \(`string`\): Updated weight.
   * @returns Promise<Product> - Resolves with the updated product instance.
   * @throws Error if product not found, invalid ID, or slug conflict.
   */
  async updateProduct(id: string, data: UpdateProductPayload) {
    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_PRODUCT_ID");
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    // If slug is being updated, check for conflicts
    if (data.slug && data.slug !== product.slug) {
      const existing = await Product.findOne({ slug: data.slug });
      if (existing) throw new Error("PRODUCT_ALREADY_EXISTS");
    }

    // Validate categoryId if provided
    if (data.categoryId && !mongoose.Types.ObjectId.isValid(data.categoryId)) {
      throw new Error("INVALID_CATEGORY_ID");
    }

    // Update product
    Object.assign(product, data);
    await product.save();
    return product;
  }
}
