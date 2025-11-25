import { Request, Response, NextFunction } from "express";
import { createPaymentSchema } from "#common/models/validation/payment.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { z } from "zod";
import { CreateMomoPaymentService } from "#common/services/payment/create-momo-payment.service.js";
import { CreateCodPaymentService } from "#common/services/payment/create-cod-payment.service.js";
import { CreateVnpayPaymentService } from "#common/services/payment/create-vnpay-payment.service.js";

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const locale = req.locale;

  try {
    const validated = createPaymentSchema.parse(req.body);

    let result;
    if (validated.paymentMethod === "MOMO") {
      result = await CreateMomoPaymentService.execute(validated);
    } else if (validated.paymentMethod === "VNPAY") {
      result = await CreateVnpayPaymentService.execute(validated);
    }else if (validated.paymentMethod === "COD") {
      result = await CreateCodPaymentService.execute(validated);
    } else {
      return apiError(res, t("payment.unsupportedMethod", locale));
    }

    return apiSuccess(res, result, t("payment.create.success", locale));
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors);
    }

    if (error instanceof Error && error.message) {
      return apiError(res, t(error.message, locale));
    }

    next(error);
  }
};
