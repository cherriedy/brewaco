import { GetProductsByCategoryService } from "#common/services/product/get-products-by-category.service.js";
import { productMeiliService } from "#common/services/search/product-meili.service.js";
import { apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { logger } from "#common/utils/logger.js";
import { pagingConfig, searchConfig } from "#config/app.js";
import { NextFunction, Request, Response } from "express";

const getProductsByCategoryService = new GetProductsByCategoryService();

export const getProductsByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, params } = req;
    const categoryId = params.id;

    const page = Math.max(0, parseInt(query.page as string) || 0);
    const pageSize = Math.min(pagingConfig.maxPageSize, parseInt(query.pageSize as string) || pagingConfig.pageSize);
    const sortBy = (query.sortBy as string) || "updatedAt";
    const sortOrder = parseInt(query.sortOrder as string) === 1 ? 1 : -1;

    const rawQ = (query.q as string) || "";
    const q = rawQ.trim().slice(searchConfig.query.startIndex, searchConfig.query.endIndex);

    if (q) {
      try {
        const result = await productMeiliService.searchDocuments(q, page, pageSize, sortBy, sortOrder === 1 ? "asc" : "desc", {
          filters: `category.id = ${categoryId}`
        });
        return apiSuccess(res, result, t("product.list.success", req.locale));
      } catch (err) {
        logger.error("MeiliSearch query failed, fallback DB:", err);
      }
    }

    const products = await getProductsByCategoryService.getProductsByCategory(page, pageSize, sortOrder, sortBy, categoryId);
    apiSuccess(res, products, t("product.list.success", req.locale));
  } catch (err) {
    next(err);
  }
};
