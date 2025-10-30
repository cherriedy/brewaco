import { updateProductSchema } from "#common/models/validation/product.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { UpdateProductService } from "../../services/product/update-product.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

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
      apiError(res, t("validation", locale), validationErrors);
      return;
    }

    // Handle invalid product ID error
    if (error instanceof Error && error.message === "INVALID_PRODUCT_ID") {
      apiError(
        res,
        t("product.invalidId", locale),
        null,
        StatusCodes.NOT_FOUND,
      );
      return;
    }

    // Handle invalid category ID error
    if (error instanceof Error && error.message === "INVALID_CATEGORY_ID") {
      apiError(
        res,
        t("category.invalidId", locale),
        null,
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    // Handle product not found error
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      apiError(res, t("product.notFound", locale), null, StatusCodes.NOT_FOUND);
      return;
    }

    // Handle duplicate product error
    if (error instanceof Error && error.message === "PRODUCT_ALREADY_EXISTS") {
      apiError(
        res,
        t("product.alreadyExists", locale),
        null,
        StatusCodes.CONFLICT,
      );
      return;
    }

    if (error instanceof Error) {
      next(error);
    }
  }
};
