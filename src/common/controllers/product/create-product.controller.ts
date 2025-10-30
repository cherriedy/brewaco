import { createProductSchema } from "#common/models/validation/product.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { CreateProductService } from "../../services/product/create-product.service.js";
import { apiError, apiSuccess } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";

const createProductService = new CreateProductService();

/**
 * Controller to handle creation of a new product.
 *
 * Expects product data in the request body, validated against `createProductSchema`.
 * Responds with the created product object on success.
 * Handles validation errors, duplicate product errors, and forwards unexpected errors.
 *
 * Access: Admin only.
 *
 * @param req - Express request object containing product data in `body`
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const validated = createProductSchema.parse(req.body);
    const product = await createProductService.createProduct(validated);
    apiSuccess(res, product, t("product.create.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      apiError(res, t("validation", locale), validationErrors);
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
