import { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { addCartItemSchema } from "#common/models/validation/cart.validation.js";
import { AddCartItemService } from "#common/services/cart/add-cart-item.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";

const addCartItemService = new AddCartItemService();

export const addCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const locale = req.locale;

  try {
    const validated = addCartItemSchema.parse(req.body);

    const result = await addCartItemService.addCartItem(
      req.user!.id,
      validated
    );

    return apiSuccess(res, result, t("cart.add.success", locale));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(res, t("validation", locale), handleZodError(error, locale));
    }
    next(error);
  }
};
