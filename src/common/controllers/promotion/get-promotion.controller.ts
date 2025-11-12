import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { GetPromotionService } from "../../services/promotion/get-promotion.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const getPromotionService = new GetPromotionService();

/**
 * Controller to handle retrieval of a single promotion by ID.
 *
 * Access: Admin or public (depending on route configuration).
 *
 * @param req - Express request object containing promotion ID in `params.id`
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const getPromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  const { id } = req.params;

  try {
    const promotion = await getPromotionService.getPromotion(id);
    apiSuccess(res, promotion, t("promotion.get.success", locale));
  } catch (error: unknown) {
    // Handle invalid ID error
    if (error instanceof Error) {
      if (error.message === "INVALID_PROMOTION_ID") {
        apiError(
          res,
          t("promotion.invalidId", locale),
          null,
          StatusCodes.BAD_REQUEST,
        );
        return;
      }
      // Handle not found error
      if (error.message === "PROMOTION_NOT_FOUND") {
        apiError(
          res,
          t("promotion.notFound", locale),
          null,
          StatusCodes.NOT_FOUND,
        );
        return;
      }
    }

    next(error);
  }
};
