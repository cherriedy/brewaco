import { GetUserPaymentsService } from "#common/services/payment/get-user-payments.service.js";
import { apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";

const getUserPaymentsService = new GetUserPaymentsService();

export const getUserPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const payments = await getUserPaymentsService.invoke(req.user!.id);
    apiSuccess(res, payments, t("payment.list.success", locale));
  } catch (error: unknown) {
    next(error);
  }
};
