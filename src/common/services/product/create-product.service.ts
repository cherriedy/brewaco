import { CreateProductPayload } from "#common/models/validation/product.validation.js";
import mongoose from "mongoose";

import { Product } from "../../models/product.model.js";
import cloudinary from "#config/cloudinary.js";
import { getSlug } from "#common/utils/text-utilities.js";

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
  async createProduct(data: CreateProductPayload & { files?: Express.Multer.File[] }) {
    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(data.categoryId)) {
      throw new Error("INVALID_CATEGORY_ID");
    }

    // Check duplicate slug
    const slug = getSlug(data.slug || data.name);
    const existing = await Product.findOne({ slug });
    if (existing) throw new Error("PRODUCT_ALREADY_EXISTS");


    // Upload images nếu có file
    let uploadedImages: string[] = [];
    if (data.files && data.files.length > 0) {
      for (const file of data.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "brewaco",
        });
        uploadedImages.push(result.secure_url);
      }
    }


    // Merge images upload + any URLs provided in `images` field
    const finalImages = [...(data.images || []), ...uploadedImages];

    const product = new Product({
      ...data,
      images: finalImages,
    });


    await product.save();
    return product;
  }
}