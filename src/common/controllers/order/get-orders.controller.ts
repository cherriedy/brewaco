import { getOrdersQuerySchema } from "#common/models/validation/order.validation.js";
import { GetOrdersService } from "#common/services/order/get-orders.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

const getOrdersService = new GetOrdersService();

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const locale = req.locale;
  try {
    const query = getOrdersQuerySchema.parse({
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      status: req.query.status,
    });
    const result = await getOrdersService.getOrders(req.user!.id, query);
    apiSuccess(res, result, t("order.get.success", locale));
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
      return;
    }
    next(error);
  }
};
