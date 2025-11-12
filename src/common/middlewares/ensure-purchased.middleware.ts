import { HasPurchasedService } from "#common/services/order/has-purchased.service.js";
import { apiError } from "#common/utils/api-response.js";
import { t } from "#common/utils/i18n.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const ensurePurchasedService = new HasPurchasedService();

/**
 * Middleware to ensure the authenticated user has purchased the specified product.
 *
 * This middleware expects the following:
 * - `req.user` contains the authenticated user's information, including `id`.
 * - `req.locale` is set for localization of error messages.
 * - `req.query.productId` contains the product ID to check.
 *
 * Behavior:
 * 1. If `productId` is missing from the query, responds with a localized error and does not call `next()`.
 * 2. Checks if the user has purchased the product using `HasPurchasedService`.
 *    - If not purchased, responds with a localized error and HTTP 403 Forbidden.
 *    - If purchased, calls `next()` to continue processing.
 * 3. For any unexpected errors, passes the error to the next error handler.
 */
export async function ensurePurchasedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user!.id;
    const locale = req.locale;
    const productId = req.query.productId as string | undefined;

    if (!productId) {
      apiError(res, t("productIdRequired", locale));
      return;
    }

    const purchased = await ensurePurchasedService.invoke(userId, productId);
    if (!purchased)
      apiError(
        res,
        t("review.validation.buyerOnly", locale),
        null,
        StatusCodes.FORBIDDEN,
      );
    next();
    return;
  } catch (error: unknown) {
    next(error);
  }
}
