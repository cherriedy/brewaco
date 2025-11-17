import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { updateCartItemSchema } from "#common/models/validation/cart.validation.js";
import { UpdateCartItemService } from "#common/services/cart/update-cart-item.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";

const updateCartItemService = new UpdateCartItemService();

export const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;

  try {
    const validated = updateCartItemSchema.parse(req.body);

    const result = await updateCartItemService.updateCartItem(
      req.user!.id,
      validated
    );

    return apiSuccess(res, result, t("cart.update.success", locale));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(res, t("validation", locale), handleZodError(error, locale));
    }
    next(error);
  }
};
