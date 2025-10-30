import {
  MeiliProduct,
  toMeiliProduct,
} from "#common/services/search/meili-search/interface/meili-product.interface.js";
import { BaseMeiliService } from "#common/services/search/meili-search/meili-search.engine.js";
import logger from "#common/utils/logger.js";

export class ProductMeiliService extends BaseMeiliService<MeiliProduct> {
  constructor() {
    const indexName = process.env.MEILI_INDEX_PRODUCTS ?? "products";
    super(indexName);
  }

  /**
   * Returns product-specific filterable attributes. These fields can be used for filtering search results.
   */
  protected getFilterableAttributes(): string[] {
    return ["category.id", "category.name", "price", "ratingsAverage", "type"];
  }

  /**
   * Returns product-specific searchable attributes. These fields are searched when a query is provided.
   */
  protected getSearchableAttributes(): string[] {
    return ["name", "type", "category.name"];
  }

  /**
   * Returns product-specific sortable attributes. These fields can be used for sorting search results.
   */
  protected getSortableAttributes(): string[] {
    return ["price", "ratingsAverage", "updatedAt", "createdAt", "name"];
  }
}

export const productMeiliService = new ProductMeiliService();

/**
 * Indexes or updates a product in MeiliSearch after it is created or updated in MongoDB.
 *
 * Usage:
 * - Call from CreateProductService after a product is successfully created.
 * - Call from UpdateProductService after a product is successfully updated.
 *
 * Behavior:
 * - Populates the categoryId field if not already populated.
 * - Converts the MongoDB product document to the MeiliSearch format.
 * - Attempts to index or update the product in MeiliSearch.
 *
 * @param product - The product document from MongoDB
 * @returns Promise<void>
 */
export const onProductUpsert = async (product: any) => {
  try {
    // Populate categoryId if it's not already populated
    if (!product.populated("categoryId")) {
      await product.populate("categoryId");
    }

    const doc = toMeiliProduct(product);
    await productMeiliService.indexDocument(doc);
    logger.info(
      `Product ${doc.id} indexed to MeiliSearch with category ${doc.category.name}`,
    );
  } catch (err) {
    // Log error but don't throw - search indexing failure shouldn't break product operations
    logger.error("MeiliSearch index upsert failed:", err);
  }
};

/**
 * Removes a product from MeiliSearch after it has been deleted from MongoDB.
 *
 * Usage:
 * - Should be called from DeleteProductService after a product is successfully deleted from the database.
 *
 * Behavior:
 * - Attempts to remove the product from the MeiliSearch index using its ID.
 *
 * @param productId - The unique identifier of the product to remove from the MeiliSearch index.
 * @returns Promise<void>
 */
export const onProductDelete = async (productId: string) => {
  try {
    await productMeiliService.deleteDocument(productId.toString());
    logger.info(`Product ${productId} deleted from MeiliSearch`);
  } catch (err) {
    // Search indexing failure shouldn't break product operations
    logger.error("MeiliSearch delete failed:", err);
  }
};
