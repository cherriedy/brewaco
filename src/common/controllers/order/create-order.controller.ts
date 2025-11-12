import { createOrderSchema } from "#common/models/validation/order.validation.js";
import { CreateOrderService } from "#common/services/order/create-order.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const createOrderService = new CreateOrderService();

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  try {
    const validated = createOrderSchema.parse(req.body);
    const result = await createOrderService.invoke(
      req.user!.id,
      validated,
    );
    res.status(201);
    apiSuccess(res, result, t("order.create.success", locale));
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }
    if (error instanceof Error) {
      if (error.message === "ORDER_INVALID_PRODUCTS") {
        apiError(res, t("order.invalidProducts", locale), null);
        return;
      }
      if (error.message === "ORDER_PRODUCT_NOT_FOUND") {
        apiError(res, t("order.productNotFound", locale), null);
        return;
      }
      if (error.message === "ORDER_INSUFFICIENT_STOCK") {
        apiError(res, t("order.insufficientStock", locale), null);
        return;
      }
    }
    next(error);
  }
};
