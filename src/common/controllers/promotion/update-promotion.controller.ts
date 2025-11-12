import { updatePromotionSchema } from "#common/models/validation/promotion.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { UpdatePromotionService } from "../../services/promotion/update-promotion.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const updatePromotionService = new UpdatePromotionService();

/**
 * Controller to handle updating an existing promotion.
 *
 * Expects promotion data in the request body, validated against `updatePromotionSchema`.
 * Responds with the updated promotion object on success.
 * Handles validation errors, not found errors, and forwards unexpected errors.
 *
 * Access: Admin only.
 *
 * @param req - Express request object containing promotion ID in `params.id` and data in `body`
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const updatePromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  const { id } = req.params;

  try {
    const validated = updatePromotionSchema.parse(req.body);
    const promotion = await updatePromotionService.updatePromotion(
      id,
      validated,
    );
    apiSuccess(res, promotion, t("promotion.update.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }

    // Handle invalid ID error
    if (error instanceof Error && error.message === "INVALID_PROMOTION_ID") {
      apiError(
        res,
        t("promotion.invalidId", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Handle not found error
    if (error instanceof Error && error.message === "PROMOTION_NOT_FOUND") {
      apiError(
        res,
        t("promotion.notFound", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
      return;
    }

    // Handle duplicate promotion error
    if (
      error instanceof Error &&
      error.message === "PROMOTION_ALREADY_EXISTS"
    ) {
      apiError(
        res,
        t("promotion.alreadyExists", locale),
        null,
        StatusCodes.CONFLICT,
      );
      return;
    }

    // Handle date validation error
    if (
      error instanceof Error &&
      error.message === "END_DATE_BEFORE_START_DATE"
    ) {
      apiError(
        res,
        t("promotion.invalidDateRange", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Handle invalid percentage value error
    if (
      error instanceof Error &&
      error.message === "INVALID_PERCENTAGE_VALUE"
    ) {
      apiError(
        res,
        t("promotion.invalidPercentageValue", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    if (error instanceof Error) {
      next(error);
    }
  }
};
