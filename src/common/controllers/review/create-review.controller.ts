import { createReviewSchema } from "#common/models/validation/review.validation.js";
import { CreateReviewService } from "#common/services/review/create-review.service.js";
import { apiError, apiSuccess } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

const createReviewService = new CreateReviewService();

/**
 * Controller to handle creation of a new review for a product.
 *
 * Expects review data in the request body (rating and comment), validated against `createReviewSchema`.
 * The productId should be passed as a query parameter or route parameter.
 * The userId is extracted from the authenticated user (req.user).
 * Responds with the created review object on success.
 * Handles validation errors, duplicate review errors, product not found errors, and forwards unexpected errors.
 *
 * Access: Authenticated users who have purchased the product.
 *
 * @param req - Express request object containing review data in `body` and user info
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const userId = req.user!.id;
    const productId = req.body.productId as string;
    const orderId = req.body.orderId as string;

    const validated = createReviewSchema.parse(req.body);
    const review = await createReviewService.createReview(
      userId,
      productId,
      orderId,
      validated
    );

    apiSuccess(res, review, t("review.create.success", locale));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors, StatusCodes.BAD_REQUEST);
      return;
    }

    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      apiError(res, t("product.notFound", locale), null, StatusCodes.NOT_FOUND);
      return;
    }

    if (error instanceof Error && error.message === "REVIEW_ALREADY_EXISTS") {
      apiError(res, t("review.alreadyExists", locale), null, StatusCodes.CONFLICT);
      return;
    }

    next(error);
  }
};