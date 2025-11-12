import { GetReviewsService } from "#common/services/review/get-reviews.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { pagingConfig } from "#config/app.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const getReviewsService = new GetReviewsService();

/**
 * Controller to handle retrieving paginated list of reviews.
 *
 * Query parameters:
 * - page (number): Page number (default: 1)
 * - limit (number): Items per page (default: from pagingConfig.pageSize, max: from pagingConfig.maxPageSize)
 * - productId (string): Filter by product ID
 * - userId (string): Filter by user ID
 * - rating (number): Filter by exact rating
 * - minRating (number): Filter by minimum rating
 * - maxRating (number): Filter by maximum rating
 *
 * Access: Admin only (protected app).
 *
 * @param req - Express request object with query parameters
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(
      parseInt(req.query.limit as string) || pagingConfig.pageSize,
      pagingConfig.maxPageSize,
    );

    // Parse filter parameters
    const filters: any = {};

    if (req.query.productId) {
      filters.productId = req.query.productId as string;
    }

    if (req.query.userId) {
      filters.userId = req.query.userId as string;
    }

    if (req.query.rating) {
      filters.rating = parseInt(req.query.rating as string);
    }

    if (req.query.minRating) {
      filters.minRating = parseInt(req.query.minRating as string);
    }

    if (req.query.maxRating) {
      filters.maxRating = parseInt(req.query.maxRating as string);
    }

    // Validate page and limit
    if (page < 1 || limit < 1) {
      apiError(
        res,
        t("validation", locale),
        { page: "Page and limit must be positive numbers" },
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    const result = await getReviewsService.invoke(page, limit, filters);

    apiSuccess(res, result, t("review.list.success", locale));
  } catch (error: unknown) {
    // Handle invalid product ID error
    if (error instanceof Error && error.message === "INVALID_PRODUCT_ID") {
      apiError(
        res,
        t("product.invalidId", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Handle invalid user ID error
    if (error instanceof Error && error.message === "INVALID_USER_ID") {
      apiError(res, t("user.invalidId", locale), null, StatusCodes.BAD_REQUEST);
      return;
    }

    next(error);
  }
};
