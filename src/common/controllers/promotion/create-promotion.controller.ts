import { createPromotionSchema } from "#common/models/validation/promotion.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { CreatePromotionService } from "../../services/promotion/create-promotion.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const createPromotionService = new CreatePromotionService();

/**
 * Controller to handle creation of a new promotion.
 *
 * Expects promotion data in the request body, validated against `createPromotionSchema`.
 * Responds with the created promotion object on success.
 * Handles validation errors, duplicate promotion errors, and forwards unexpected errors.
 *
 * Access: Admin only.
 *
 * @param req - Express request object containing promotion data in `body`
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const createPromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const validated = createPromotionSchema.parse(req.body);
    const promotion = await createPromotionService.createPromotion(validated);
    apiSuccess(res, promotion, t("promotion.create.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
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

    next(error);
  }
};
