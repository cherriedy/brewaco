import { pagingConfig } from "#config/app.js";
import { NextFunction, Request, Response } from "express";

import { GetPromotionsService } from "../../services/promotion/get-promotions.service.js";
import { apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const getPromotionsService = new GetPromotionsService();

/**
 * Controller to handle retrieval of all promotions with pagination.
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - active: Filter by active status (optional)
 *
 * Access: Admin or public (depending on route configuration).
 *
 * @param req - Express request object containing query parameters
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const getPromotions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || pagingConfig.pageSize;
  const active =
    req.query.active === "true"
      ? true
      : req.query.active === "false"
        ? false
        : undefined;

  try {
    const promotions = await getPromotionsService.getPromotions(
      page,
      Math.max(limit, pagingConfig.maxPageSize),
      active,
    );
    apiSuccess(res, promotions, t("promotion.list.success", locale));
  } catch (error: unknown) {
    next(error);
  }
};
