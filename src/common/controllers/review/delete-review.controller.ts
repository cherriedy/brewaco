import { DeleteReviewService } from "#common/services/review/delete-review.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const deleteReviewService = new DeleteReviewService();

/**
 * Controller to handle deleting an existing review.
 *
 * The reviewId should be passed as a route parameter.
 * The userId is extracted from the authenticated user (req.user).
 * Responds with success message on successful deletion.
 * Handles ownership errors, time restriction errors, and forwards unexpected errors.
 *
 * Access: Authenticated users who own the review and within allowed time period.
 *
 * @param req - Express request object containing reviewId in `params` and user info
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const deleteReview = async (
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

    await deleteReviewService.deleteReview(userId, reviewId);

    apiSuccess(res, null, t("review.delete.success", locale));
  } catch (error: unknown) {
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
      error.message === "REVIEW_DELETE_PERIOD_EXPIRED"
    ) {
      apiError(
        res,
        t("review.deletePeriodExpired", locale),
        null,
        StatusCodes.FORBIDDEN,
      );
      return;
    }

    next(error);
  }
};
