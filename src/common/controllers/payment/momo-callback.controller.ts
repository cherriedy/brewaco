import { Request, Response, NextFunction } from "express";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { VerifyMomoCallbackService } from "#common/services/payment/verify-momo-callback.service.js";

export const momoCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const locale = req.locale;

  try {
    const payment = await VerifyMomoCallbackService.execute(req.body);
    return apiSuccess(
      res,
      payment,
      t("payment.momo.callbackSuccess", locale)
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return apiError(res, error.message);
    }
    next(error);
  }
};
