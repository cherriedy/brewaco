import { GetProductsService } from "#common/services/product/get-products.service.js";
import { apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { pagingConfig } from "#config/app.js";
import { NextFunction, Request, Response } from "express";

const getProductsService = new GetProductsService();

/**
 * Controller for fetching a paginated list of products.
 *
 * - Returns a subset of product fields optimized for UI display.
 * - Supports both public and protected endpoints.
 * - Query parameters:
 *    - `page`: Page number (default: 0)
 *    - `pageSize`: Number of products per page (default: from config)
 *    - `sortBy`: Field to sort by (default: "updatedAt")
 *    - `sortOrder`: 1 for ascending, -1 for descending (default: -1)
 * - Handles localization for success messages.
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const pageSize =
      parseInt(req.query.pageSize as string) || pagingConfig.pageSize;
    const sortBy = (req.query.sortBy as string) || "updatedAt";
    const sortOrder = parseInt(req.query.sortOrder as string) === 1 ? 1 : -1;

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
