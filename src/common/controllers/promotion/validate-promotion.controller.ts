import { validatePromotionSchema } from "#common/models/validation/promotion.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { ValidatePromotionService } from "../../services/promotion/validate-promotion.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const validatePromotionService = new ValidatePromotionService();

/**
 * Controller to handle validation of a promotion code.
 *
 * Expects promotion code and order value in the request body.
 * Responds with validation result and discount details on success.
 *
 * Access: Public.
 *
 * @param req - Express request object containing promotion data in `body`
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const validatePromotion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;

  try {
    const validated = validatePromotionSchema.parse(req.body);
    const result = await validatePromotionService.validatePromotion(validated);
    apiSuccess(res, result, t("promotion.validate.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
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

    // Handle promotion not started error
    if (error instanceof Error && error.message === "PROMOTION_NOT_STARTED") {
      apiError(
        res,
        t("promotion.notStarted", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Handle promotion expired error
    if (error instanceof Error && error.message === "PROMOTION_EXPIRED") {
      apiError(
        res,
        t("promotion.expired", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Handle order value too low error
    if (error instanceof Error && error.message === "ORDER_VALUE_TOO_LOW") {
      apiError(
        res,
        t("promotion.orderValueTooLow", locale),
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
