import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { GetPaymentService } from "../../services/payment/get-payment.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const getPaymentService = new GetPaymentService();

export const getPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const locale = req.locale;

  try {
    const payment = await getPaymentService.getPayment(req.params.id);
    apiSuccess(res, payment, t("payment.get.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "INVALID_PAYMENT_ID") {
        apiError(
          res,
          t("payment.invalidId", locale),
          null,
          StatusCodes.NOT_FOUND
        );
        return;
      }

      if (error.message === "PAYMENT_NOT_FOUND") {
        apiError(
          res,
          t("payment.notFound", locale),
          null,
          StatusCodes.NOT_FOUND
        );
        return;
      }
    }

    next(error);
  }
};
