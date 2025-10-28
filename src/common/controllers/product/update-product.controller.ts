import { NextFunction, Request, Response } from "express";
import { UpdateProductService } from "../../services/product/update-product.service.js";
import { apiSuccess, apiError } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import { z } from "zod";
import { updateProductSchema } from "#common/models/validation/product.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { StatusCodes } from "http-status-codes";

const updateProductService = new UpdateProductService();

/**
 * Controller to handle updating an existing product.
 *
 * Expects product ID in request params and update data in request body.
 * Validates data against `updateProductSchema`.
 * Responds with the updated product object on success.
 *
 * Access: Admin only.
 *
 * @param req - Express request object containing product ID in `params.id` and update data in `body`
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const validated = updateProductSchema.parse(req.body);
    const product = await updateProductService.updateProduct(
      req.params.id,
      validated,
    );
    apiSuccess(res, product, t("product.update.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors);
    }

    // Handle invalid product ID error
    if (error instanceof Error && error.message === "INVALID_PRODUCT_ID") {
      return apiError(
        res,
        t("product.invalidId", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
    }

    // Handle invalid category ID error
    if (error instanceof Error && error.message === "INVALID_CATEGORY_ID") {
      return apiError(
        res,
        t("category.invalidId", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
    }

    // Handle product not found error
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return apiError(
        res,
        t("product.notFound", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
    }

    // Handle duplicate product error
    if (error instanceof Error && error.message === "PRODUCT_ALREADY_EXISTS") {
      return apiError(
        res,
        t("product.alreadyExists", locale),
        null,
        StatusCodes.CONFLICT,
      );
    }

    if (error instanceof Error) {
      next(error);
    }
  }
};
