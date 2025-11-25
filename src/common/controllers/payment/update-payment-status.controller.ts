import { Request, Response, NextFunction } from "express";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { UpdatePaymentStatusService } from "#common/services/payment/update-cod-status-payment.service.js";
import { updatePaymentStatusSchema } from "#common/models/validation/payment.validation.js";

const updatePaymentStatusService = new UpdatePaymentStatusService();

export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  const locale = req.locale;
  try {
    const validated = updatePaymentStatusSchema.parse(req.body);
    const payment = await updatePaymentStatusService.updatePaymentStatus(req.params.id, validated);
    apiSuccess(res, payment, t("payment.update.success", locale));
  } catch (err: any) {
    if (err instanceof Error) {
      if (err.message === "PAYMENT_NOT_FOUND") {
        return apiError(res, t("payment.notFound", locale), null, 404);
      }
      if (err.message === "PAYMENT_METHOD_NOT_ALLOWED") {
        return apiError(res, t("payment.onlyCODAllowed", locale), null, 400);
      }
      if (err.message === "PAYMENT_INVALID_STATUS") {
        return apiError(res, t("payment.invalidStatus", locale), null, 400);
      }
      if (err.message === "PAYMENT_INVALID_STATUS_TRANSITION") {
        return apiError(res, t("payment.invalidStatusTransition", locale), null, 400);
      }
      return apiError(res, err.message);
    }
    next(err);
  }
};
