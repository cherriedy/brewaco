import { GetReviewsService } from "#common/services/review/get-reviews-by-order.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";

const getReviewsService = new GetReviewsService();

export const getReviewsByOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const locale = req.locale;
  const { orderId } = req.params;

  try {
    // ⭐ Pass userId để check quyền truy cập
    const reviews = await getReviewsService.getReviewsByOrder(orderId, req.user!.id);
    apiSuccess(res, reviews, t("review.get.success", locale));
  } catch (err: unknown) {
    let message = "Lỗi khi lấy đánh giá";
    if (err instanceof Error) {
      switch (err.message) {
        case "INVALID_ORDER_ID":
          message = t("review.invalidOrderId", locale);
          break;
        case "ORDER_NOT_FOUND":
          message = t("review.orderNotFound", locale);
          break;
        default:
          message = err.message;
      }
    }
    apiError(res, message);
  }
};
