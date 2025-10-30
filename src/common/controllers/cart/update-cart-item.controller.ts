import { updateCartItemSchema } from "#common/models/validation/cart.validation.js";
import { UpdateCartItemService } from "#common/services/cart/update-cart-item.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const updateCartItemService = new UpdateCartItemService();

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  const validated = updateCartItemSchema.parse(req.body);
  const result = await updateCartItemService.updateCartItem(
    req.user!.id,
    validated,
  );
  apiSuccess(res, result, t("cart.update.success", locale));
  try {
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }
    if (error instanceof Error) {
      if (error.message === "INVALID_USER_ID") {
        apiError(res, t("invalidUserId", locale), null);
        return;
      }
      if (error.message === "INVALID_PRODUCT_ID") {
        apiError(res, t("cart.invalidProductId", locale), null);
        return;
      }
    }
    next(error);
  }
};
