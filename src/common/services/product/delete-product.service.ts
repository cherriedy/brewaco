import { Product } from "../../models/product.model.js";
import mongoose from "mongoose";

export class DeleteProductService {
  /**
   * Deletes a product from the database using its unique identifier.
   * Throws an error if the product does not exist.
   *
   * @param id - The unique identifier of the product to delete.
   * @returns Promise resolving to the deleted product document.
   * @throws Error if the product ID is invalid or product not found.
   */
  async deleteProduct(id: string) {
    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("INVALID_PRODUCT_ID");
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return product;
  }
}
