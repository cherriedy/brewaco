import { Request, Response, NextFunction } from "express";
import { Cart } from "#common/models/cart.model.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";

export const clearCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const locale = req.locale;

  try {
    const userId = req.user!.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return apiSuccess(res, null, t("cart.clear.empty", locale));
    }

    cart.items = [];
    await cart.save();

    return apiSuccess(res, cart, t("cart.clear.success", locale));
  } catch (error) {
    return apiError(res, t("cart.clear.failed", locale), error);
  }
};