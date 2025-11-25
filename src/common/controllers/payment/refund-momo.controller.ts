import { Request, Response, NextFunction } from "express";
import { RefundMomoPaymentService } from "#common/services/payment/refund-momo-payment.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";

export const refundMomo = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const locale = req.locale;

    try {
        const { paymentId } = req.body;

        const result = await RefundMomoPaymentService.execute(paymentId);

        return apiSuccess(res, result, t("payment.refund.success", locale));
    } catch (err: any) {
        if (err instanceof Error) {
            if (err.message === "PAYMENT_NOT_FOUND")
                return apiError(res, t("payment.notFound", locale), null, 404);

            if (err.message === "INVALID_PAYMENT_METHOD")
                return apiError(res, t("payment.onlyMomoAllowed", locale), null, 400);

            if (err.message === "PAYMENT_NOT_PAID")
                return apiError(res, t("payment.notPaid", locale), null, 400);

            if (err.message === "ORDER_NOT_FOUND")
                return apiError(res, t("order.notFound", locale), null, 404);

            if (err.message === "ORDER_NOT_CANCELLED")
                return apiError(res, t("order.mustCancelBeforeRefund", locale), null, 400);

            if (err.message.startsWith("Refund failed"))
                return apiError(res, err.message, null, 400);

            return apiError(res, err.message);
        }

        next(err);
    }
};
