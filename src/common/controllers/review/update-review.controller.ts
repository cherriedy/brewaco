import {
  createReviewSchema,
  updateReviewSchema,
} from "#common/models/validation/review.validation.js";
import { UpdateReviewService } from "#common/services/review/update-review.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

const updateReviewService = new UpdateReviewService();

/**
 * Controller to handle updating an existing review.
 *
 * Expects review data in the request body (rating and comment), validated against `createReviewSchema`.
 * The reviewId should be passed as a route parameter.
 * The userId is extracted from the authenticated user (req.user).
 * Responds with the updated review object on success.
 * Handles validation errors, ownership errors, time restriction errors, and forwards unexpected errors.
 *
 * Access: Authenticated users who own the review and within allowed time period.
 *
 * @param req - Express request object containing review data in `body`, reviewId in `params`, and user info
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const userId = req.user!.id;
    const reviewId = req.params.id;

    if (!reviewId) {
      apiError(
        res,
        t("review.invalidId", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    const validated = updateReviewSchema.parse(req.body);
    const review = await updateReviewService.updateReview(
      userId,
      reviewId,
      validated,
    );

    apiSuccess(res, review, t("review.update.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(
        res,
        t("validation", locale),
        validationErrors,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Handle invalid review ID error
    if (error instanceof Error && error.message === "INVALID_REVIEW_ID") {
      apiError(
        res,
        t("review.invalidId", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Handle review not found error
    if (error instanceof Error && error.message === "REVIEW_NOT_FOUND") {
      apiError(res, t("review.notFound", locale), null, StatusCodes.NOT_FOUND);
      return;
    }

    // Handle review ownership error
    if (error instanceof Error && error.message === "REVIEW_NOT_OWNED") {
      apiError(res, t("review.notOwned", locale), null, StatusCodes.FORBIDDEN);
      return;
    }

    // Handle time restriction error
    if (
      error instanceof Error &&
      error.message === "REVIEW_UPDATE_PERIOD_EXPIRED"
    ) {
      apiError(
        res,
        t("review.updatePeriodExpired", locale),
        null,
        StatusCodes.FORBIDDEN,
      );
      return;
    }

    next(error);
  }
};
