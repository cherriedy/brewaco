import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { DeletePaymentService } from "../../services/payment/delete-payment.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const deletePaymentService = new DeletePaymentService();

export const deletePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const locale = req.locale;

  try {
    await deletePaymentService.deletePayment(req.params.id);
    apiSuccess(res, null, t("payment.delete.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "PAYMENT_NOT_FOUND") {
      apiError(
        res,
        t("payment.notFound", locale),
        null,
        StatusCodes.NOT_FOUND
      );
      return;
    }

    next(error);
  }
};
