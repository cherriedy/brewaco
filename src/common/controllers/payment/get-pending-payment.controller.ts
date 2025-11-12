import { GetPendingPaymentService } from "#common/services/payment/get-pending-payment.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getPendingPaymentService = new GetPendingPaymentService();

export const getPendingPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const { orderId } = req.params;

    const payment = await getPendingPaymentService.invoke(orderId);

    if (!payment) {
      res.status(404);
      apiError(res, t("payment.noPendingPayment", locale), null);
      return;
    }

    res.status(200);
    apiSuccess(res, payment, t("payment.get.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "PAYMENT_EXPIRED") {
        apiError(res, t("payment.expired", locale), null, StatusCodes.GONE);
        return;
      }
    }
    next(error);
  }
};
