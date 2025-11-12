import { GetPaymentByOrderIdService } from "#common/services/payment/get-payment-by-order-id.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";

const getPaymentByOrderIdService = new GetPaymentByOrderIdService();

export const getPaymentByOrderId = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const { orderId } = req.params;
    const payment = await getPaymentByOrderIdService.invoke(orderId);
    apiSuccess(res, payment, t("payment.get.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "PAYMENT_NOT_FOUND") {
        res.status(404);
        apiError(res, t("payment.notFound", locale), null);
        return;
      }
    }
    next(error);
  }
};
