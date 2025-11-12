import { CancelOrderService } from "#common/services/order/cancel-order.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";

const cancelOrderService = new CancelOrderService();

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  try {
    const result = await cancelOrderService.cancelOrder(
      req.user!.id,
      req.params.id,
    );
    apiSuccess(res, result, t("order.cancel.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "ORDER_NOT_FOUND") {
        apiError(res, t("order.notFound", locale), null, 404);
        return;
      }
      if (error.message === "ORDER_CANNOT_BE_CANCELLED") {
        apiError(res, t("order.cannotBeCancelled", locale), null, 400);
        return;
      }
    }
    next(error);
  }
};
