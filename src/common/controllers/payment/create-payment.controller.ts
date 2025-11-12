import { createPaymentSchema } from "#common/models/validation/payment.validation.js";
import { CreatePaymentService } from "#common/services/payment/create-payment.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

const createPaymentService = new CreatePaymentService();

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const validated = createPaymentSchema.parse(req.body);

    const result = await createPaymentService.invoke(
      validated.orderId,
      req.user!.id,
      {
        ipAddr: req.ip,
        orderInfo:
          validated.orderInfo || `Payment for order ${validated.orderId}`,
      },
    );

    apiSuccess(res, result, t("payment.create.success", locale));
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }
    if (error instanceof Error) {
      if (error.message === "PAYMENT_ORDER_NOT_FOUND") {
        res.status(404);
        apiError(res, t("payment.orderNotFound", locale), null);
        return;
      }
      if (error.message === "PAYMENT_UNAUTHORIZED") {
        apiError(
          res,
          t("payment.unauthorized", locale),
          null,
          StatusCodes.FORBIDDEN,
        );
        return;
      }
      if (error.message === "PAYMENT_INVALID_ORDER_STATUS") {
        apiError(res, t("payment.invalidOrderStatus", locale), null);
        return;
      }
      if (error.message === "PAYMENT_GATEWAY_NOT_SUPPORTED") {
        apiError(res, t("payment.gatewayNotSupported", locale), null);
        return;
      }
    }
    next(error);
  }
};
