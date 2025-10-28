import { NextFunction, Request, Response } from "express";
import { CreateCategoryService } from "../../services/category/create-category.service.js";
import { apiSuccess, apiError } from "../../utils/api-response.js";
import { t } from "../../utils/i18n.js";
import { z } from "zod";
import { createCategorySchema } from "#common/models/validation/category.validation.js";
import { handleZodError } from "#common/utils/zod-error-handler.js";
import { StatusCodes } from "http-status-codes";

const createCategoryService = new CreateCategoryService();

/**
 * Controller to handle creation of a new category.
 *
 * Expects category data in the request body, validated against `createCategorySchema`.
 * Responds with the created category object on success.
 * Handles validation errors, duplicate category errors, and forwards unexpected errors.
 *
 * Access: Admin only.
 *
 * @param req - Express request object containing category data in `body`
 * @param res - Express response object for sending API responses
 * @param next - Express next function for error handling middleware
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const locale = req.locale;
  try {
    const validated = createCategorySchema.parse(req.body);
    const category = await createCategoryService.createCategory(validated);
    apiSuccess(res, category, t("category.create.success", locale));
  } catch (error: unknown) {
    // Handle validation errors from Zod
    if (error instanceof z.ZodError) {
      const validationErrors = handleZodError(error, locale);
      return apiError(res, t("validation", locale), validationErrors);
    }

    // Handle duplicate category error
    if (error instanceof Error && error.message === "CATEGORY_ALREADY_EXISTS") {
      return apiError(
        res,
        t("category.alreadyExists", locale),
        null,
        StatusCodes.CONFLICT,
      );
    }

    if (error instanceof Error) {
      next(error);
    }
  }
};
