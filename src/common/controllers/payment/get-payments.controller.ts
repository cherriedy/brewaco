import { GetPaymentsService } from "#common/services/payment/get-payments.service.js";
import { apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { pagingConfig } from "#config/app.js";
import { Payment as IPayment } from "#interfaces/payment.interface.js";
import { Request, Response, NextFunction } from "express";

const getPaymentsService = new GetPaymentsService();

export const getPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const pageSize =
      parseInt(req.query.pageSize as string) || pagingConfig.pageSize;

    const sortBy = (req.query.sortBy as string) || "updatedAt";
    const sortOrder = parseInt(req.query.sortOrder as string) === 1 ? 1 : -1;

    const payments = await getPaymentsService.getPayments(
      page,
      pageSize,
      sortOrder,
      sortBy as keyof IPayment
    );

    apiSuccess(res, payments, t("payment.list.success", req.locale));
  } catch (error) {
    next(error);
  }
};
