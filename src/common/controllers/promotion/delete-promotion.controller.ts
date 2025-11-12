import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { DeletePromotionService } from "../../services/promotion/delete-promotion.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const deletePromotionService = new DeletePromotionService();

/**
 * Controller to handle deletion of a promotion by ID.
 *
 * Access: Admin only.
 *
 * @param req - Express request object containing promotion ID in `params.id`
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const deletePromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  const { id } = req.params;

  try {
    await deletePromotionService.deletePromotion(id);
    apiSuccess(res, null, t("promotion.delete.success", locale));
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
