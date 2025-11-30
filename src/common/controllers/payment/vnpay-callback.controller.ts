import { Request, Response, NextFunction } from "express";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { VerifyVnpayCallbackService } from "#common/services/payment/verify-vnpay-callback.service.js";
import logger from "#common/utils/logger.js";

export const vnpayCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;

  try {
    logger.info("VNPay Callback Request Body:", req.body);
    const payment = await VerifyVnpayCallbackService.execute(req.body);
    return apiSuccess(res, payment, t("payment.vnpay.callbackSuccess", locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      return apiError(res, error.message);
    }
    next(error);
  }
};
