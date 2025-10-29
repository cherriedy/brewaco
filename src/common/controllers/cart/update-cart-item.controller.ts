import { NextFunction, Request, Response } from "express";
import { UpdateCartItemService } from "#common/services/cart/update-cart-item.service.js";
import { updateCartItemSchema } from "#common/models/validation/cart.validation.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { z } from "zod";

const updateCartItemService = new UpdateCartItemService();

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  const validated = updateCartItemSchema.parse(req.body);
  const result = await updateCartItemService.updateCartItem(req.user!!.id, validated);
  apiSuccess(res, result, t("cart.update.success", locale));
  try {
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors);
    }
    if (error instanceof Error) {
      if (error.message === "INVALID_USER_ID") {
        return apiError(res, t("invalidUserId", locale), null);
      }
      if (error.message === "INVALID_PRODUCT_ID") {
        return apiError(res, t("cart.invalidProductId", locale), null);
      }
    }
    next(error);
  }
};
