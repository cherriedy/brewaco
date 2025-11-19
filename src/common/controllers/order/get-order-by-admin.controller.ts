import { GetOrderByIdForAdminService } from "#common/services/order/get-order-by-admin.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";

const getOrderByIdService = new GetOrderByIdForAdminService();

export const getOrderByIdForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  try {
    const result = await getOrderByIdService.getOrderById(
      req.params.id,
    );
    apiSuccess(res, result, t("order.get.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "ORDER_NOT_FOUND") {
        apiError(res, t("order.notFound", locale), null, 404);
        return;
      }
    }
    next(error);
  }
};
