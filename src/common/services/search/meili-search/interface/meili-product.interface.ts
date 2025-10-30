import { Product } from "#interfaces/product.interface.js";

export type MeiliProduct = Omit<
  Product,
  | "_id"
  | "categoryId"
  | "createdAt"
  | "description"
  | "origin"
  | "stock"
  | "updatedAt"
> & {
  category: { id: string; name: string };
  id: string;
};

/**
 * Converts a MongoDB Product document to a MeiliSearch-compatible document.
 *
 * This utility function transforms product data from MongoDB format
 * (with Mongoose ObjectIds and Date objects) into a flat structure
 * optimized for search indexing with string IDs and simplified category info.
 *
 * - Converts `_id` and `categoryId` ObjectIds to string values.
 * - Flattens the `categoryId` field into a `category` object with `id` and `name`.
 * - Removes fields not needed for search indexing (e.g., description, origin, stock).
 * - Ensures default values for optional fields (e.g., discount, ratings).
 *
 * @param product - The MongoDB product document. Must include `_id` and a populated `categoryId` object from Mongoose.
 * @returns A `MeiliProduct` document ready for indexing in MeiliSearch.
 */
export function toMeiliProduct(product: any): MeiliProduct {
  const categoryId =
    typeof product.categoryId === "object"
      ? product.categoryId._id.toString()
      : product.categoryId.toString();

  const categoryName =
    typeof product.categoryId === "object" ? product.categoryId.name : "";

  return {
    category: {
      id: categoryId,
      name: categoryName,
    },
    discount: product.discount ?? 0,
    id: product._id.toString(),
    images: product.images ?? [],
    name: product.name,
    price: product.price,
    ratingsAverage: product.ratingsAverage ?? 0,
    ratingsCount: product.ratingsCount ?? 0,
    slug: product.slug,
    type: product.type,
    weight: product.weight,
  };
}
