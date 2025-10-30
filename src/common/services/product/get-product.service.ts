import mongoose from "mongoose";

import { Product } from "../../models/product.model.js";

export class GetProductService {
  /**
   * Retrieves a single product by its unique identifier.
   *
   * This method queries the database for a product document matching the provided ID.
   * If the product is found, it is returned. If not, an error is thrown indicating
   * that the product does not exist.
   *
   * @param id - The unique identifier of the product to retrieve.
   * @returns Promise<Product> - Resolves with the product instance if found.
   * @throws Error - Throws "PRODUCT_NOT_FOUND" if no product matches the given ID.
   * @throws Error - Throws "INVALID_PRODUCT_ID" if the provided ID is not a valid MongoDB ObjectId.
   */
  async getProduct(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_PRODUCT_ID");
    }
    const product = await Product.findById(id).populate(
      "categoryId", // Replace with actual category field if different
      "name slug", // Fields to select from the category
    );
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return product;
  }
}
