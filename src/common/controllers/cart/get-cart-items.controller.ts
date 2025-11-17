import { GetCartItemsService } from "#common/services/cart/get-cart-items.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import logger from "#common/utils/logger.js";
import { NextFunction, Request, Response } from "express";

const getCartItemsService = new GetCartItemsService();

export const getCartItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  try {
    const items = await getCartItemsService.getItems(req.user!.id);
    apiSuccess(res, items, t("cart.list.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "INVALID_USER_ID") {
      apiError(res, t("invalidUserId", locale), null);
    }

    if (error instanceof Error) {
      next(error); // Propagate errors to the global error handler
    }
  }
};
