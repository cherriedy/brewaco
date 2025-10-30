import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { GetProductService } from "../../services/product/get-product.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const getProductService = new GetProductService();

/**
 * Retrieves a single product by its unique identifier.
 *
 * Access: Public
 *
 * @param req - Express request object; expects `id` parameter in `req.params`
 * @param res - Express response object used to send API responses
 * @param next - Express next function for error handling middleware
 */
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;

  try {
    const product = await getProductService.getProduct(req.params.id);
    apiSuccess(res, product, t("product.get.success", locale));
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "INVALID_PRODUCT_ID") {
        apiError(
          res,
          t("product.invalidId", locale),
          null,
          StatusCodes.NOT_FOUND,
        );
        return;
      }
      if (error.message === "PRODUCT_NOT_FOUND") {
        apiError(
          res,
          t("product.notFound", locale),
          null,
          StatusCodes.NOT_FOUND,
        );
        return;
      }
    }

    if (error instanceof Error) {
      next(error); // Propagate other errors to the global error handler
    }
  }
};
