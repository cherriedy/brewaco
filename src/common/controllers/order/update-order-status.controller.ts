import { updateOrderStatusSchema } from "#common/models/validation/order.validation.js";
import { UpdateOrderStatusService } from "#common/services/order/update-order-status.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const updateOrderStatusService = new UpdateOrderStatusService();

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  try {
    const validated = updateOrderStatusSchema.parse(req.body);
    const result = await updateOrderStatusService.updateOrderStatus(
      req.params.id,
      validated,
    );
    apiSuccess(res, result, t("order.update.success", locale));
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }
    if (error instanceof Error) {
      if (error.message === "ORDER_NOT_FOUND") {
        apiError(res, t("order.notFound", locale), null, 404);
        return;
      }
      if (error.message === "ORDER_INVALID_STATUS_TRANSITION") {
        apiError(res, t("order.invalidStatusTransition", locale), null, 400);
        return;
      }
      if (error.message === "PAYMENT_INVALID_STATUS_TRANSITION") {
        apiError(res, t("order.invalidPaymentStatusTransition", locale), null, 400);
        return;
      }
    }
    next(error);
  }
};
