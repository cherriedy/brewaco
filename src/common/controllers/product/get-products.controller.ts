import { GetProductsService } from "#common/services/product/get-products.service.js";
import { productMeiliService } from "#common/services/search/product-meili.service.js";
import { apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { logger } from "#common/utils/logger.js";
import { pagingConfig, searchConfig } from "#config/app.js";
import { NextFunction, Request, Response } from "express";

const getProductsService = new GetProductsService();

/**
 * Controller for fetching a paginated list of products.
 *
 * - Returns a subset of product fields optimized for UI display.
 * - Supports both public and protected endpoints.
 * - Query parameters:
 *    - `q`: Search query for full-text search via MeiliSearch (optional)
 *    - `page`: Page number (default: 0)
 *    - `pageSize`: Number of products per page (default: from config, max: 100)
 *    - `sortBy`: Field to sort by (default: "updatedAt")
 *    - `sortOrder`: 1 for ascending, -1 for descending (default: -1)
 * - When `q` is provided, uses MeiliSearch for fast full-text search
 * - When `q` is empty, falls back to MongoDB for standard listing
 * - Handles localization for success messages.
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = req;

    const page = Math.max(0, parseInt(query.page as string) || 0);
    const pageSize = Math.min(
      pagingConfig.maxPageSize,
      parseInt(query.pageSize as string) || pagingConfig.pageSize,
    );
    const sortBy = (query.sortBy as string) || "updatedAt";
    const sortOrder = parseInt(query.sortOrder as string) === 1 ? 1 : -1;

    // Extract and sanitize search query
    const rawQ = (query.q as string) || "";
    // Limit query length to prevent abuse
    const q = rawQ
      .trim()
      .slice(searchConfig.query.startIndex, searchConfig.query.endIndex);

    // Use MeiliSearch when search query is provided
    if (q) {
      try {
        const result = await productMeiliService.searchDocuments(
          q,
          page,
          pageSize,
          sortBy,
          sortOrder === 1 ? "asc" : "desc",
        );
        apiSuccess(res, result, t("product.list.success", req.locale));
        return;
      } catch (searchError) {
        // If MeiliSearch fails, log and fall back to MongoDB search
        logger.error(
          "MeiliSearch query failed, falling back to MongoDB search:",
          searchError,
        );

        // Fallback to MongoDB-based search
        const products = await getProductsService.searchProducts(
          q,
          page,
          pageSize,
          sortOrder,
          sortBy,
        );
        apiSuccess(res, products, t("product.list.success", req.locale));
        return;
      }
    }

    // No search query provided, return standard product listing
    const products = await getProductsService.getProducts(
      page,
      pageSize,
      sortOrder,
      sortBy,
    );
    apiSuccess(res, products, t("product.list.success", req.locale));
  } catch (error: unknown) {
    next(error); // Propagate other errors to the global error handler
  }
};
