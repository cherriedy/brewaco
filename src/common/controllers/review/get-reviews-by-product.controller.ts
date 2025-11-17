import { NextFunction, Request, Response } from "express";
import { apiSuccess, apiError } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import { StatusCodes } from "http-status-codes";
import { pagingConfig } from "#config/app.js";
import { GetReviewsService } from "#common/services/review/get-reviews-by-product.service.js";


const getReviewsService = new GetReviewsService();

/**
 * Lấy danh sách review theo productId với query params: page, limit
 */
export const getReviewsByProductId = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  const productId = req.params.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || pagingConfig.pageSize;

  try {
    if (!productId) {
      apiError(res, t("productIdRequired", locale), null, StatusCodes.BAD_REQUEST);
      return;
    }

    const reviews = await getReviewsService.getReviewsByProductId(productId, page, limit);

    apiSuccess(res, reviews, t("review.list.success", locale));
  } catch (error: unknown) {
    next(error);
  }
};
