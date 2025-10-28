import { NextFunction, Request, Response } from "express";
import { DeleteProductService } from "../../services/product/delete-product.service.js";
import { apiSuccess, apiError } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import { StatusCodes } from "http-status-codes";

const deleteProductService = new DeleteProductService();

/**
 * Deletes a product by its ID. Accessible to admin users only.
 *
 * This controller expects the product ID to be provided in the request parameters.
 * On successful deletion, it returns a localized success message.
 * If the product does not exist, it responds with a 404 error and a localized not found message.
 * Any other errors are passed to the next middleware for handling.
 *
 * Access: Admin
 *
 * @param req - Express request object containing the product ID in `req.params.id`
 * @param res - Express response object used to send the API response
 * @param next - Express next function for error handling
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    await deleteProductService.deleteProduct(req.params.id);
    apiSuccess(res, null, t("product.delete.success", locale));
  } catch (error: unknown) {
    // Handle invalid ID error
    if (error instanceof Error && error.message === "INVALID_PRODUCT_ID") {
      return apiError(
        res,
        t("product.invalidId", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
    }

    // Handle not found error
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return apiError(
        res,
        t("product.notFound", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
    }

    if (error instanceof Error) {
      next(error);
    }
  }
};
