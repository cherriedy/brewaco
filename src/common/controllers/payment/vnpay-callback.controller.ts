import { UpdatePaymentStatusService } from "#common/services/payment/update-payment-status.service.js";
import { VerifyPaymentService } from "#common/services/payment/verify-payment.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";

const verifyPaymentService = new VerifyPaymentService();
const updatePaymentStatusService = new UpdatePaymentStatusService();

export const vnpayReturn = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    // Verify payment with VNPay callback params
    const result = await verifyPaymentService.invoke("VNPay", req.query);

    // Extract order ID from params
    const orderId = req.query.vnp_TxnRef as string;

    if (!orderId) {
      apiError(res, t("payment.invalidCallback", locale), null);
      return;
    }

    // Update payment status based on result
    await updatePaymentStatusService.invoke(
      orderId,
      result.status,
      result.transactionId,
    );

    if (result.status === "SUCCESS") {
      // Redirect to success page or return success response
      apiSuccess(
        res,
        {
          amount: result.amount,
          orderId,
          status: result.status,
          transactionId: result.transactionId,
        },
        t("payment.success", locale),
      );
    } else {
      // Redirect to failure page or return failure response
      res.status(400);
      apiError(res, t("payment.failed", locale), {
        orderId,
        status: result.status,
      });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "PAYMENT_NOT_FOUND") {
        res.status(404);
        apiError(res, t("payment.notFound", locale), null);
        return;
      }
      if (error.message === "PAYMENT_GATEWAY_NOT_SUPPORTED") {
        res.status(400);
        apiError(res, t("payment.gatewayNotSupported", locale), null);
        return;
      }
    }
    next(error);
  }
};
